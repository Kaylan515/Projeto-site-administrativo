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