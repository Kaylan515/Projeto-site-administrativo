"""Regression tests for authorization, pagination and transactional boundaries."""
import json
from datetime import datetime, timedelta

import pytest
from app.auth import criar_token, get_admin, get_usuario_logado, get_usuario_opcional, hash_senha
from app.main import app
from app.models.armario import Armario, ReservaArmario, StatusArmario
from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.movimentacao import Movimentacao
from app.models.produto import Produto
from app.models.usuario import Usuario
from app.models.venda import Venda, ItemVenda


@pytest.fixture
def acesso_real(cliente, monkeypatch):
    import app.auth as auth
    monkeypatch.setattr(auth, 'SECRET_KEY', 'segredo-exclusivo-dos-testes')
    for dependency in [get_admin, get_usuario_logado, get_usuario_opcional]:
        app.dependency_overrides.pop(dependency, None)
    cliente.cookies.clear()
    return cliente


@pytest.mark.parametrize('path', ['/dashboard', '/produtos/', '/produtos/novo', '/clientes/', '/clientes/novo', '/categorias/', '/categorias/nova', '/usuarios/', '/usuarios/novo', '/armarios/', '/armarios/historico', '/movimentacoes/', '/pdv/', '/pdv/historico', '/pdv/extrato'])
def test_rotas_protegidas_sem_cookie_redirecionam(acesso_real, path):
    response = acesso_real.get(path, follow_redirects=False)
    assert response.status_code == 303
    assert response.headers['location'] == '/auth/login?mensagem=sessao_expirada'


@pytest.mark.parametrize('path', ['/usuarios/', '/usuarios/novo', '/categorias/', '/categorias/nova', '/clientes/', '/clientes/novo', '/armarios/novo', '/produtos/novo'])
def test_operador_nao_acessa_administracao(acesso_real, path):
    acesso_real.cookies.set('access_token', criar_token({'sub': 'op@test.local', 'nome': 'Operador', 'role': 'operador'}))
    response = acesso_real.get(path, follow_redirects=False)
    assert response.status_code == 403
    assert 'Acesso indispon' in response.text


@pytest.mark.parametrize('token', ['token-invalido', '', 'abc.def.ghi'])
def test_token_invalido_nao_autentica(acesso_real, token):
    acesso_real.cookies.set('access_token', token)
    assert acesso_real.get('/dashboard', follow_redirects=False).status_code == 303
    assert acesso_real.get('/').status_code == 200


def test_pix_e_finalizacao_sem_login_nao_operam(acesso_real, db_session):
    for path,data in [('/pdv/pix/qr', {'valor_centavos':100}), ('/pdv/finalizar', {'carrinho_json':'[]'})]:
        assert acesso_real.post(path, data=data, follow_redirects=False).status_code == 303
    assert db_session.query(Venda).count() == 0


@pytest.mark.parametrize('path', ['/produtos/99999', '/produtos/99999/editar', '/clientes/99999/editar', '/usuarios/99999/editar', '/categorias/99999/editar', '/armarios/99999', '/armarios/99999/editar', '/armarios/99999/historico', '/pdv/venda/99999'])
def test_registros_inexistentes_nao_causam_500(cliente, path):
    assert cliente.get(path, follow_redirects=False).status_code == 302


@pytest.mark.parametrize('pagina,esperada', [(-10,1), (0,1), (1,1), (2,2), (999,2)])
def test_paginacao_produtos_limites_e_filtro(cliente, db_session, pagina, esperada):
    db_session.add_all([Produto(nome=f'Produto {i:02d}',preco=1,estoque_atual=2) for i in range(12)])
    db_session.commit()
    response=cliente.get('/produtos/',params={'pagina':pagina,'estoque_baixo':'true'})
    assert response.status_code == 200
    assert response.context['pagina'] == esperada
    assert response.context['total_paginas'] == 2
    assert len(response.context['produtos']) == (10 if esperada == 1 else 2)
    assert 'estoque_baixo=true' in response.text


@pytest.mark.parametrize('forma', ['PIX','Dinheiro','Cartão de Débito','Cartão de Crédito'])
def test_venda_persiste_cada_forma_e_ignora_preco_enviado(cliente, db_session, forma):
    produto=Produto(nome='Produto real',preco=12.5,estoque_atual=3)
    db_session.add(produto); db_session.commit()
    response=cliente.post('/pdv/finalizar',data={'carrinho_json':json.dumps([{'produto_id':produto.id,'quantidade':2,'preco':0.01,'nome':'Nome falso'}]),'pagamentos_json':json.dumps({forma:2500}), 'pix_recebido':'true'},follow_redirects=False)
    assert response.headers['location'].startswith('/pdv/venda/')
    db_session.expire_all()
    venda=db_session.query(Venda).one()
    assert venda.pagamentos == {forma:2500}
    assert venda.total_liquido == 25
    assert venda.itens[0].produto_nome == 'Produto real'
    assert venda.itens[0].preco_unitario == 12.5
    assert db_session.get(Produto,produto.id).estoque_atual == 1


@pytest.mark.parametrize('payments', ['{', '[]', 'null', '123', '"texto"', '{"Dinheiro":"1000"}', '{"Dinheiro":9007199254740992}'])
def test_pagamentos_json_malformado_nao_altera_banco(cliente,db_session,payments):
    produto=Produto(nome='Teste',preco=10,estoque_atual=2)
    db_session.add(produto);db_session.commit()
    response=cliente.post('/pdv/finalizar',data={'carrinho_json':json.dumps([{'produto_id':produto.id,'quantidade':1}]),'pagamentos_json':payments},follow_redirects=False)
    assert response.headers['location']=='/pdv?erro=pagamento'
    assert db_session.query(Venda).count()==0
    assert db_session.query(ItemVenda).count()==0
    assert db_session.get(Produto,produto.id).estoque_atual==2


def test_multiplos_itens_sem_estoque_nao_criam_venda_parcial(cliente,db_session):
    a=Produto(nome='A',preco=1,estoque_atual=5); b=Produto(nome='B',preco=1,estoque_atual=0)
    db_session.add_all([a,b]);db_session.commit()
    r=cliente.post('/pdv/finalizar',data={'carrinho_json':json.dumps([{'produto_id':a.id,'quantidade':2},{'produto_id':b.id,'quantidade':1}]),'pagamentos_json':json.dumps({'Dinheiro':300})},follow_redirects=False)
    assert 'erro=estoque' in r.headers['location']
    assert db_session.query(Venda).count()==0
    assert db_session.query(ItemVenda).count()==0
    assert db_session.get(Produto,a.id).estoque_atual==5


def test_venda_antiga_sem_pagamento_continua_visivel(cliente,db_session):
    venda=Venda(total_bruto=10,total_liquido=10)
    db_session.add(venda);db_session.commit()
    for path in [f'/pdv/venda/{venda.id}','/pdv/historico','/pdv/extrato']:
        r=cliente.get(path)
        assert r.status_code==200
        assert 'Não informado' in r.text


def test_extrato_contabiliza_apenas_vendas_do_dia(cliente,db_session):
    hoje=datetime.now().replace(hour=12,minute=0,second=0,microsecond=0)
    db_session.add_all([Venda(total_bruto=100,total_liquido=90,criado_em=hoje),Venda(total_bruto=25,total_liquido=25,criado_em=hoje),Venda(total_bruto=500,total_liquido=500,criado_em=hoje-timedelta(days=1))]);db_session.commit()
    context=cliente.get('/pdv/extrato').context
    assert context['quantidade_vendas']==2
    assert context['total_bruto']==125
    assert context['total_liquido']==115
    assert context['total_descontos']==10


def test_filtro_historico_vendas_por_cliente_data_e_paginacao(cliente,db_session):
    pessoa=Cliente(nome='Pessoa filtrada')
    db_session.add(pessoa);db_session.flush()
    db_session.add_all([Venda(cliente_id=pessoa.id,total_bruto=i,total_liquido=i,criado_em=datetime(2026,1,10,12)) for i in range(12)])
    db_session.add(Venda(total_bruto=100,total_liquido=100,criado_em=datetime(2025,1,1)))
    db_session.commit()
    r=cliente.get('/pdv/historico',params={'cliente_id':pessoa.id,'data_inicio':'2026-01-10','data_fim':'2026-01-10','pagina':2,'ordenar_por':'total','direcao':'asc'})
    assert r.status_code==200
    assert r.context['total_vendas']==12
    assert [v.total_liquido for v in r.context['vendas']]==[10,11]


@pytest.mark.parametrize('tipo,quantidade', [('invalido',1),('entrada',0),('saida',-1)])
def test_movimentacao_invalida_preserva_estoque(cliente,db_session,tipo,quantidade):
    p=Produto(nome='Estoque',preco=1,estoque_atual=5)
    db_session.add(p);db_session.commit()
    r=cliente.post('/movimentacoes/nova',data={'produto_id':p.id,'tipo':tipo,'quantidade':quantidade,'preco_unitario':1})
    assert r.status_code==400
    assert db_session.get(Produto,p.id).estoque_atual==5
    assert db_session.query(Movimentacao).count()==0


def test_aluguel_duplicado_preserva_primeira_reserva(cliente,db_session):
    a=Armario(numero='TESTE')
    db_session.add(a);db_session.commit()
    cliente.post(f'/armarios/{a.id}/alugar',data={'locatario_nome':'Primeiro','semestre':'2026.2'})
    r=cliente.post(f'/armarios/{a.id}/alugar',data={'locatario_nome':'Segundo','semestre':'2026.2'},follow_redirects=False)
    assert 'erro=ja_alugado' in r.headers['location']
    assert db_session.query(ReservaArmario).count()==1
    assert db_session.get(Armario,a.id).locatario_nome=='Primeiro'


def test_admin_nao_desativa_propria_conta(cliente,db_session):
    u=Usuario(nome='Admin',email='teste@admin.com',senha_hash=hash_senha('senha'),role='admin')
    db_session.add(u);db_session.commit()
    r=cliente.post(f'/usuarios/{u.id}/toggle-ativo',follow_redirects=False)
    assert 'erro=autoproprio' in r.headers['location']
    assert db_session.get(Usuario,u.id).ativo


def test_alteracao_senha_na_edicao(cliente,db_session):
    from app.auth import verificar_senha
    u=Usuario(nome='Operador',email='senha@test.local',senha_hash=hash_senha('antiga'),role='operador')
    db_session.add(u);db_session.commit()
    original=u.senha_hash
    data={'nome':u.nome,'email':u.email,'role':u.role,'senha':''}
    cliente.post(f'/usuarios/{u.id}/editar',data=data)
    assert db_session.get(Usuario,u.id).senha_hash==original
    cliente.post(f'/usuarios/{u.id}/editar',data={**data,'senha':'nova'})
    assert verificar_senha('nova',db_session.get(Usuario,u.id).senha_hash)


def test_404_tem_pagina_de_erro(cliente):
    r=cliente.get('/rota-que-nao-existe')
    assert r.status_code==404
    assert '404' in r.text
    assert 'Voltar ao painel' in r.text


def test_edicao_armario_duplicado_retorna_erro_sem_perder_dados(cliente,db_session):
    a=Armario(numero='A01');b=Armario(numero='B01')
    db_session.add_all([a,b]);db_session.commit()
    r=cliente.post(f'/armarios/{b.id}/editar',data={'numero':'A01','localizacao':'Teste'})
    assert r.status_code==400
    assert db_session.get(Armario,b.id).numero=='B01'


def test_cliente_matricula_conflitante_na_edicao(cliente,db_session):
    a=Cliente(nome='A',matricula='A01');b=Cliente(nome='B',matricula='B01')
    db_session.add_all([a,b]);db_session.commit()
    r=cliente.post(f'/clientes/{b.id}/editar',data={'nome':'Alterado','matricula':'A01'},follow_redirects=False)
    assert 'erro=matricula' in r.headers['location']
    assert db_session.get(Cliente,b.id).matricula=='B01'
    assert db_session.get(Cliente,b.id).nome=='B'


def test_categoria_conflitante_na_edicao(cliente,db_session):
    a=Categoria(nome='A');b=Categoria(nome='B')
    db_session.add_all([a,b]);db_session.commit()
    r=cliente.post(f'/categorias/{b.id}/editar',data={'nome':'A'})
    assert r.status_code==400
    assert db_session.get(Categoria,b.id).nome=='B'


def test_usuario_conflitante_na_edicao(cliente,db_session):
    a=Usuario(nome='A',email='a@test.local',senha_hash='hash',role='operador')
    b=Usuario(nome='B',email='b@test.local',senha_hash='hash',role='operador')
    db_session.add_all([a,b]);db_session.commit()
    r=cliente.post(f'/usuarios/{b.id}/editar',data={'nome':'Outro','email':a.email,'role':'admin'})
    assert r.status_code==400
    assert db_session.get(Usuario,b.id).email=='b@test.local'


def test_historico_com_filtros_invalidos_nao_falha(cliente):
    r=cliente.get('/pdv/historico',params={'ordenar_por':'invalido','direcao':'invalida','data_inicio':'nao-data','pagina':-5})
    assert r.status_code==200
    assert r.context['pagina']==1
    assert r.context['ordenar_por']=='data'
    assert r.context['direcao']=='desc'
    assert r.context['data_inicio']==''
