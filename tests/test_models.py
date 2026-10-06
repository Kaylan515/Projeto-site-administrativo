from app.models.produto import Produto

def test_estoque_baixo_quando_estoque_zero():
    produto1 = Produto(nome="Camisa", estoque_atual=0)

    assert produto1.estoque_baixo is True

def test_estoque_baixo_no_limite_5():
    produto1 = Produto(nome="Camisa", estoque_atual=5)

    assert produto1.estoque_baixo is True

def test_estoque_baixo_false_quando_estoque_confortavel():
    produto1 = Produto(nome="Camisa", estoque_atual=6)

    assert produto1.estoque_baixo is False