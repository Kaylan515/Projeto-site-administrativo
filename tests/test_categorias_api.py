from app.models.categoria import Categoria


def test_listar_e_exibir_form_categoria(cliente):
    assert cliente.get("/categorias/").status_code == 200
    assert cliente.get("/categorias/nova").status_code == 200


def test_criar_categoria_e_rejeitar_duplicada(cliente):
    criada = cliente.post("/categorias/nova", data={"nome": "Uniformes"}, follow_redirects=False)
    assert criada.status_code == 302
    assert criada.headers["location"] == "/categorias?criado=ok"
    duplicada = cliente.post("/categorias/nova", data={"nome": "Uniformes"})
    assert duplicada.status_code == 400


def test_editar_categoria_e_toggle_ativo(cliente, db_session):
    categoria = Categoria(nome="Antiga")
    db_session.add(categoria)
    db_session.commit()
    assert cliente.get(f"/categorias/{categoria.id}/editar").status_code == 200
    resposta = cliente.post(f"/categorias/{categoria.id}/editar", data={"nome": "Nova"}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.get(Categoria, categoria.id).nome == "Nova"
    cliente.post(f"/categorias/{categoria.id}/toggle-ativo")
    assert db_session.get(Categoria, categoria.id).ativo is False


def test_editar_categoria_inexistente_redireciona(cliente):
    assert cliente.get("/categorias/999/editar", follow_redirects=False).status_code == 302
