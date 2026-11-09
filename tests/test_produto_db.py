# pip install httpx

from app.models.produto import Produto
from app.models.categoria import Categoria

def test_criar_produto_categoria(db_session):

    categoria = Categoria(nome="Uniformes")
    db_session.add(categoria)
    db_session.commit()

    assert categoria.id is not None

    #Criar um produto
    produto = Produto(nome="Camisa Senai", preco=40.00, estoque_atual=20, categoria_id=categoria.id)
    db_session.add(produto)
    db_session.commit()

    procurar_produto = db_session.query(Produto).filter(Produto.nome == "Camisa Senai").first()

    assert procurar_produto is not None

    assert procurar_produto.preco == 40.00

    #Testa o relaciomento
    assert procurar_produto.categoria.nome == "Uniformes"


#Exercício
# testar produtos ativos por padrão quando não informado

def test_produto_ativo_por_padrao(db_session):
    categoria = Categoria(nome="Uniformes")
    db_session.add(categoria)
    db_session.commit()

    produto = Produto(nome="Camisa Senai", preco=40.00, estoque_atual=20, categoria_id=categoria.id)
    db_session.add(produto)
    db_session.commit()

    procurar_produto = db_session.query(Produto).filter(Produto.nome == "Camisa Senai").first()

    assert procurar_produto is not None
    assert procurar_produto.ativo == True

def test_dashboard_e_filtro_estoque_baixo(cliente, db_session):
    from app.main import _dados_dashboard
    from app.models.produto import Produto
    db_session.add_all([
        Produto(nome='Estoque zerado teste', preco=1, estoque_atual=0),
        Produto(nome='Estoque limite teste', preco=1, estoque_atual=5),
        Produto(nome='Estoque normal teste', preco=1, estoque_atual=6),
        Produto(nome='Estoque inativo teste', preco=1, estoque_atual=1, ativo=False),
    ])
    db_session.commit()
    assert _dados_dashboard(db_session)['total_estoque_baixo'] == 2
    page = cliente.get('/dashboard')
    assert page.status_code == 200
    assert '<div class="card-value">2</div>' in page.text
    filtered = cliente.get('/produtos/?estoque_baixo=true')
    assert filtered.status_code == 200
    assert 'Estoque zerado teste' in filtered.text
    assert 'Estoque limite teste' in filtered.text
    assert 'Estoque normal teste' not in filtered.text
    assert 'Estoque inativo teste' not in filtered.text
    assert 'name="estoque_baixo" value="true"' in filtered.text
