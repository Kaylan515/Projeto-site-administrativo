from app.models.movimentacao import Movimentacao
from app.models.produto import Produto


def test_forms_e_historico_movimentacoes(cliente, db_session):
    produto = Produto(nome="Caneta", preco=2.5, estoque_atual=10)
    db_session.add(produto)
    db_session.commit()
    assert cliente.get("/movimentacoes/").status_code == 200
    assert cliente.get("/movimentacoes/nova", params={"produto_id": produto.id}).status_code == 200
    assert cliente.get(f"/movimentacoes/produto/{produto.id}").status_code == 200


def test_registrar_entrada_atualiza_estoque_e_historico(cliente, db_session):
    produto = Produto(nome="Caneta", preco=2.5, estoque_atual=10)
    db_session.add(produto)
    db_session.commit()
    resposta = cliente.post("/movimentacoes/nova", data={"produto_id": produto.id, "tipo": "entrada", "quantidade": 3, "preco_unitario": 2.5, "observacao": "Reposição"}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.get(Produto, produto.id).estoque_atual == 13
    assert db_session.query(Movimentacao).filter_by(produto_id=produto.id).count() == 1


def test_rejeitar_saida_maior_que_estoque(cliente, db_session):
    produto = Produto(nome="Caneta", preco=2.5, estoque_atual=2)
    db_session.add(produto)
    db_session.commit()
    resposta = cliente.post("/movimentacoes/nova", data={"produto_id": produto.id, "tipo": "saida", "quantidade": 3, "preco_unitario": 2.5})
    assert resposta.status_code == 400
    assert db_session.get(Produto, produto.id).estoque_atual == 2


def test_historico_produto_inexistente_redireciona(cliente):
    assert cliente.get("/movimentacoes/produto/999", follow_redirects=False).status_code == 302
