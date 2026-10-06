# Testando as rotas HTTP com TestClient

from app.models.produto import Produto
from app.models.categoria import Categoria

#testar a pagina inicial
def test_pagina_inicial_retorna_200(cliente):

    resposta = cliente.get("/")

    # 200 = ok: a página carregou sem erro!
    assert resposta.status_code == 200

#Teste entrando na rota de pdv
def test_tela_pdv_retorna_200(cliente):

    resposta = cliente.get("/pdv")
    assert resposta.status_code == 200

#Teste página de produtos retorna os produtos criados
def test_pagina_produtos_lista_produtos_criados(cliente, db_session):
    #criar uma categoria
    categoria = Categoria(nome="Bonés")
    db_session.add(categoria)
    db_session.commit()

    #Criar um produto
    produto = Produto(nome="Boné aba reta", preco=50.00, estoque_atual=45, categoria_id=categoria.id)
    db_session.add(produto)
    db_session.commit()

    resposta = cliente.get("/produtos/")

    assert "Boné aba reta" in resposta.text

# Teste buscar produtos cadastrado
def test_buscar_produtos_filtrado_por_busca(cliente,db_session):
    db_session.add_all(
        [
            Produto(nome="Boné aba reta", preco=50.00, estoque_atual=45),
            Produto(nome="Caneca Harry Potter", preco=50.00, estoque_atual=8)
        ]
    )
    db_session.commit()

    resposta = cliente.get("/produtos/", params={"busca": "Harry"})

    assert "Caneca Harry Potter" in resposta.text
    assert "Boné aba reta" not in resposta.text

# Teste criar um produto novo - post
def test_criar_produto_com_sucesso(cliente):
    resposta = cliente.post(
        "/produtos/novo",
        data={"nome": "Camisa Polo", "preco": 80.00, "estoque_atual": 10},
        follow_redirects=False
        )

    assert resposta.status_code == 302
    assert resposta.headers["location"] == "/produtos?criado=ok"

    resposta_lista = cliente.get("/produtos/")

    assert "Camisa Polo" in resposta_lista.text


def test_formulario_detalhe_e_edicao_de_produto(cliente, db_session):
    produto = Produto(nome="Caderno", preco=12.5, estoque_atual=8)
    db_session.add(produto)
    db_session.commit()

    assert cliente.get("/produtos/novo").status_code == 200
    assert cliente.get(f"/produtos/{produto.id}").status_code == 200
    assert cliente.get(f"/produtos/{produto.id}/editar").status_code == 200

    resposta = cliente.post(
        f"/produtos/{produto.id}/editar",
        data={"nome": "Caderno novo", "preco": 15, "estoque_atual": 9, "possui_variacao": "nao", "variacao": "", "categoria_id": 0},
        follow_redirects=False,
    )
    assert resposta.status_code == 302
    atualizado = db_session.get(Produto, produto.id)
    assert atualizado.nome == "Caderno novo"
    assert atualizado.estoque_atual == 9


def test_rejeitar_produto_duplicado_e_desativar(cliente, db_session):
    produto = Produto(nome="Caneca", preco=20, estoque_atual=3)
    db_session.add(produto)
    db_session.commit()

    duplicado = cliente.post("/produtos/novo", data={"nome": "Caneca", "preco": 25, "estoque_atual": 2})
    assert duplicado.status_code == 400
    cliente.post(f"/produtos/{produto.id}/desativar")
    assert db_session.get(Produto, produto.id).ativo is False


def test_produto_inexistente_redireciona(cliente):
    assert cliente.get("/produtos/999", follow_redirects=False).status_code == 302
    assert cliente.get("/produtos/999/editar", follow_redirects=False).status_code == 302
