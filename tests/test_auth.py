from app.auth import hash_senha, verificar_senha

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