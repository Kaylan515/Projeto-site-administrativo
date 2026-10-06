from app.models.armario import Armario, ReservaArmario, StatusArmario


def test_listar_forms_e_historico_armarios(cliente):
    assert cliente.get("/armarios/").status_code == 200
    assert cliente.get("/armarios/novo").status_code == 200
    assert cliente.get("/armarios/historico").status_code == 200


def test_criar_alugar_liberar_armario(cliente, db_session):
    criado = cliente.post("/armarios/novo", data={"numero": " a01 ", "localizacao": "Bloco A"}, follow_redirects=False)
    assert criado.status_code == 302
    armario = db_session.query(Armario).one()
    assert armario.numero == "A01"
    alugado = cliente.post(f"/armarios/{armario.id}/alugar", data={"locatario_nome": "Caio", "semestre": "2026.2"}, follow_redirects=False)
    assert alugado.status_code == 302
    assert db_session.get(Armario, armario.id).status == StatusArmario.ALUGADO
    assert db_session.query(ReservaArmario).count() == 1
    cliente.post(f"/armarios/{armario.id}/liberar")
    assert db_session.get(Armario, armario.id).status == StatusArmario.DISPONIVEL
    assert db_session.query(ReservaArmario).one().encerrado_em is not None


def test_editar_e_visualizar_armario(cliente, db_session):
    armario = Armario(numero="B01", localizacao="Bloco B")
    db_session.add(armario)
    db_session.commit()
    assert cliente.get(f"/armarios/{armario.id}").status_code == 200
    assert cliente.get(f"/armarios/{armario.id}/editar").status_code == 200
    assert cliente.get(f"/armarios/{armario.id}/alugar").status_code == 200
    resposta = cliente.post(f"/armarios/{armario.id}/editar", data={"numero": "B02", "localizacao": "Bloco C"}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.get(Armario, armario.id).numero == "B02"
    assert cliente.get(f"/armarios/{armario.id}/historico").status_code == 200


def test_rejeitar_numero_de_armario_duplicado(cliente, db_session):
    db_session.add(Armario(numero="A01"))
    db_session.commit()
    assert cliente.post("/armarios/novo", data={"numero": "a01"}).status_code == 400
