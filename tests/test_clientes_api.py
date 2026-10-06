from app.models.cliente import Cliente


def test_listar_e_exibir_form_cliente(cliente):
    assert cliente.get("/clientes/").status_code == 200
    assert cliente.get("/clientes/novo").status_code == 200


def test_criar_cliente_com_associacao(cliente, db_session):
    resposta = cliente.post("/clientes/novo", data={"nome": "Ana Silva", "matricula": "A123", "telefone": "11999990000", "is_associado": "true"}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.query(Cliente).filter_by(matricula="A123", is_associado=True).first() is not None


def test_rejeitar_matricula_duplicada(cliente, db_session):
    db_session.add(Cliente(nome="Ana", matricula="A123"))
    db_session.commit()
    resposta = cliente.post("/clientes/novo", data={"nome": "Outra", "matricula": "A123"})
    assert resposta.status_code == 400


def test_editar_e_alternar_cliente(cliente, db_session):
    cliente_db = Cliente(nome="Ana", matricula="A123")
    db_session.add(cliente_db)
    db_session.commit()
    assert cliente.get(f"/clientes/{cliente_db.id}/editar").status_code == 200
    resposta = cliente.post(f"/clientes/{cliente_db.id}/editar", data={"nome": "Ana Silva", "matricula": "", "telefone": "", "is_associado": "true"}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.get(Cliente, cliente_db.id).nome == "Ana Silva"
    cliente.post(f"/clientes/{cliente_db.id}/toggle-ativo")
    assert db_session.get(Cliente, cliente_db.id).ativo is False


def test_editar_cliente_inexistente_redireciona(cliente):
    assert cliente.get("/clientes/999/editar", follow_redirects=False).status_code == 302
