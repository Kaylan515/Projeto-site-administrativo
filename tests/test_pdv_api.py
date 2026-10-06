import json

from app.models.cliente import Cliente
from app.models.produto import Produto
from app.models.venda import ItemVenda, Venda


def test_rotas_de_consulta_pdv(cliente):
    assert cliente.get("/pdv/").status_code == 200
    assert cliente.get("/pdv/historico").status_code == 200
    assert cliente.get("/pdv/extrato").status_code == 200
    assert cliente.get("/pdv/venda/999", follow_redirects=False).status_code == 302


def test_finalizar_venda_com_desconto_associado_e_baixa_estoque(cliente, db_session):
    produto = Produto(nome="Caderno", preco=20, estoque_atual=5)
    associado = Cliente(nome="Joana", matricula="J1", is_associado=True)
    db_session.add_all([produto, associado])
    db_session.commit()
    resposta = cliente.post("/pdv/finalizar", data={"carrinho_json": json.dumps([{"produto_id": produto.id, "quantidade": 2}]), "cliente_id": associado.id}, follow_redirects=False)
    assert resposta.status_code == 302
    venda = db_session.query(Venda).one()
    assert venda.total_bruto == 40
    assert venda.total_liquido == 36
    assert venda.desconto_percentual == 10
    assert db_session.get(Produto, produto.id).estoque_atual == 3
    assert db_session.query(ItemVenda).filter_by(venda_id=venda.id).one().quantidade == 2


def test_finalizar_venda_rejeita_json_vazio_e_estoque_insuficiente(cliente, db_session):
    vazio = cliente.post("/pdv/finalizar", data={"carrinho_json": "[]"}, follow_redirects=False)
    assert vazio.headers["location"] == "/pdv?erro=vazio"
    produto = Produto(nome="Lápis", preco=1, estoque_atual=1)
    db_session.add(produto)
    db_session.commit()
    resposta = cliente.post("/pdv/finalizar", data={"carrinho_json": json.dumps([{"produto_id": produto.id, "quantidade": 2}])}, follow_redirects=False)
    assert resposta.headers["location"].startswith("/pdv?erro=estoque")
    assert db_session.query(Venda).count() == 0
