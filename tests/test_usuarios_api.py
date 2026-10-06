from app.auth import hash_senha, verificar_senha
from app.models.usuario import Usuario


def test_listar_e_exibir_form_usuario(cliente):
    assert cliente.get("/usuarios/").status_code == 200
    assert cliente.get("/usuarios/novo").status_code == 200


def test_criar_usuario_editar_e_alternar_status(cliente, db_session):
    criado = cliente.post("/usuarios/novo", data={"nome": "Operador", "email": "op@example.com", "senha": "senha123", "role": "operador"}, follow_redirects=False)
    assert criado.status_code == 302
    usuario = db_session.query(Usuario).filter_by(email="op@example.com").one()
    assert verificar_senha("senha123", usuario.senha_hash)
    assert cliente.get(f"/usuarios/{usuario.id}/editar").status_code == 200
    resposta = cliente.post(f"/usuarios/{usuario.id}/editar", data={"nome": "Operador 2", "email": usuario.email, "role": "admin", "senha": ""}, follow_redirects=False)
    assert resposta.status_code == 302
    assert db_session.get(Usuario, usuario.id).nome == "Operador 2"
    cliente.post(f"/usuarios/{usuario.id}/toggle-ativo")
    assert db_session.get(Usuario, usuario.id).ativo is False


def test_rejeitar_email_duplicado_e_perfil_invalido(cliente, db_session):
    db_session.add(Usuario(nome="Existente", email="dup@example.com", senha_hash=hash_senha("x"), role="operador"))
    db_session.commit()
    duplicado = cliente.post("/usuarios/novo", data={"nome": "Outro", "email": "dup@example.com", "senha": "senha", "role": "operador"})
    invalido = cliente.post("/usuarios/novo", data={"nome": "Outro", "email": "outro@example.com", "senha": "senha", "role": "root"})
    assert duplicado.status_code == 400
    assert invalido.status_code == 400
