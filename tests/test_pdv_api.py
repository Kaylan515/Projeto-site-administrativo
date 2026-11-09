import json

import pytest

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
    resposta = cliente.post("/pdv/finalizar", data={"carrinho_json": json.dumps([{"produto_id": produto.id, "quantidade": 2}]), "cliente_id": associado.id, "pagamentos_json": json.dumps({"PIX": 1600, "Dinheiro": 2000}), "pix_recebido": "true"}, follow_redirects=False)
    assert resposta.status_code == 302
    venda = db_session.query(Venda).one()
    db_session.expire_all()
    assert db_session.get(Venda, venda.id).pagamentos == {"PIX": 1600, "Dinheiro": 2000}
    assert venda.total_bruto == 40
    assert venda.total_liquido == 36
    assert venda.desconto_percentual == 10
    assert db_session.get(Produto, produto.id).estoque_atual == 3
    assert db_session.query(ItemVenda).filter_by(venda_id=venda.id).one().quantidade == 2
    for url in [f"/pdv/venda/{venda.id}", "/pdv/historico", "/pdv/extrato"]:
        page = cliente.get(url)
        assert page.status_code == 200
        assert "PIX" in page.text and "Dinheiro" in page.text
        assert "16.00" in page.text and "20.00" in page.text


def test_finalizar_venda_rejeita_json_vazio_e_estoque_insuficiente(cliente, db_session):
    vazio = cliente.post("/pdv/finalizar", data={"carrinho_json": "[]"}, follow_redirects=False)
    assert vazio.headers["location"] == "/pdv?erro=vazio"
    produto = Produto(nome="Lápis", preco=1, estoque_atual=1)
    db_session.add(produto)
    db_session.commit()
    resposta = cliente.post("/pdv/finalizar", data={"carrinho_json": json.dumps([{"produto_id": produto.id, "quantidade": 2}])}, follow_redirects=False)
    assert resposta.headers["location"].startswith("/pdv?erro=estoque")
    assert db_session.query(Venda).count() == 0


@pytest.mark.parametrize("pagamentos", [None, {}, {"PIX": 999}, {"PIX": 1001}, {"PIX": -1, "Dinheiro": 1001}, {"PIX": 1000.0}, {"PIX": True}, {"Invalido": 1000}])
def test_pagamentos_invalidos_nao_criam_venda_ou_baixam_estoque(cliente, db_session, pagamentos):
    produto = Produto(nome="Caneta", preco=10, estoque_atual=3)
    db_session.add(produto)
    db_session.commit()
    resposta = cliente.post('/pdv/finalizar', data={
        'carrinho_json': json.dumps([{'produto_id': produto.id, 'quantidade': 1}]),
        'pagamentos_json': json.dumps(pagamentos),
    }, follow_redirects=False)
    assert resposta.headers['location'] == '/pdv?erro=pagamento'
    assert db_session.query(Venda).count() == 0
    assert db_session.query(ItemVenda).count() == 0
    assert db_session.get(Produto, produto.id).estoque_atual == 3


@pytest.mark.parametrize('itens', [None, 1, 'texto', {'produto_id': 1}, [None], [{}], [{'produto_id': 1, 'quantidade': None}], [{'produto_id': 1, 'quantidade': 'abc'}], [{'produto_id': 1, 'quantidade': True}], [{'produto_id': 1, 'quantidade': 1}, {'produto_id': 1, 'quantidade': 1}]])
def test_carrinho_malformado_nao_causa_erro_interno(cliente, db_session, itens):
    resposta = cliente.post('/pdv/finalizar', data={'carrinho_json': json.dumps(itens)}, follow_redirects=False)
    assert resposta.status_code == 302
    assert resposta.headers['location'] in ['/pdv?erro=json', '/pdv?erro=quantidade']
    assert db_session.query(Venda).count() == 0


def test_pix_sem_confirmacao_nao_finaliza_venda(cliente, db_session):
    produto = Produto(nome='PIX pendente', preco=10, estoque_atual=2)
    db_session.add(produto)
    db_session.commit()
    data = {'carrinho_json': json.dumps([{'produto_id': produto.id, 'quantidade': 1}]), 'pagamentos_json': json.dumps({'PIX': 1000})}
    response = cliente.post('/pdv/finalizar', data=data, follow_redirects=False)
    assert response.headers['location'] == '/pdv?erro=pix_pendente'
    assert db_session.query(Venda).count() == 0
    assert db_session.get(Produto, produto.id).estoque_atual == 2
    response = cliente.post('/pdv/finalizar', data={**data, 'pix_recebido': 'true'}, follow_redirects=False)
    assert response.headers['location'].startswith('/pdv/venda/')
    assert db_session.query(Venda).one().pagamentos == {'PIX': 1000}
