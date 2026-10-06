from app.auth import hash_senha, verificar_senha
from app.models.usuario import Usuario

def test_hash_senha_gera_string_diferente_original():
    senha = "minhasenhateste123"

    #chmar a  função real para tetar
    senha_hash = hash_senha(senha)

    assert senha_hash != senha

def test_verificar_senha_aceita_senha_correta():
    senha = "minhasenhateste123"
    senha_hash = hash_senha(senha)

    resultado = verificar_senha(senha, senha_hash)

    assert resultado is True

def test_verificar_senha_rejeita_senha_errada():
    senha = "minhasenhateste123"
    senha_hash = hash_senha(senha)
    senha_errada = "outrasenha"

    resultado = verificar_senha(senha_errada, senha_hash)

    #Assert: o caminho negativo.
    # Garantir que o sistema rejeite as senhas erradas.
    assert resultado is False


def test_rotas_publicas_de_autenticacao(cliente):
    assert cliente.get("/auth/login").status_code == 200
    registro = cliente.get("/auth/register", follow_redirects=False)
    assert registro.status_code == 303
    assert registro.headers["location"] == "/auth/login"
    logout = cliente.get("/auth/logout", follow_redirects=False)
    assert logout.status_code == 302
    assert "access_token" in logout.headers.get("set-cookie", "")
    assert "max-age=0" in logout.headers.get("set-cookie", "").lower()


def test_login_valido_invalido_e_usuario_inativo(cliente, db_session, monkeypatch):
    # O ambiente de testes pode não configurar a chave JWT da aplicação.
    import app.auth as auth
    monkeypatch.setattr(auth, "SECRET_KEY", "chave-de-teste-segura")

    usuario = Usuario(nome="Operador", email="op@example.com", senha_hash=hash_senha("senha123"), role="operador")
    db_session.add(usuario)
    db_session.commit()

    sucesso = cliente.post("/auth/login", data={"email": usuario.email, "senha": "senha123"}, follow_redirects=False)
    assert sucesso.status_code == 302
    assert sucesso.headers["location"] == "/"
    assert "access_token" in sucesso.headers.get("set-cookie", "")

    invalido = cliente.post("/auth/login", data={"email": usuario.email, "senha": "errada"})
    assert invalido.status_code == 401

    usuario.ativo = False
    db_session.commit()
    inativo = cliente.post("/auth/login", data={"email": usuario.email, "senha": "senha123"})
    assert inativo.status_code == 403


def test_cadastro_publico_redireciona_sem_criar_usuario(cliente, db_session):
    resposta = cliente.post("/auth/register", data={"nome": "Novo", "email": "novo@example.com", "senha": "senha123"}, follow_redirects=False)
    assert resposta.status_code == 303
    assert resposta.headers["location"] == "/auth/login?mensagem=cadastro_restrito"
    assert db_session.query(Usuario).filter_by(email="novo@example.com").first() is None
