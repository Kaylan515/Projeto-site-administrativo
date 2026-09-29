from app.database import SessionLocal, engine, Base
from app.models.usuario import Usuario
from app.models.categoria import Categoria
from app.models.produto import Produto
from app.models.armario import Armario
from app.auth import hash_senha

# Garante que as tabelas existem antes de inserir
Base.metadata.create_all(bind=engine)

# Usuários a criar — fácil de expandir conforme o projeto cresce
USUARIOS = [
    {
        "nome": "Admin do Sistema",
        "email": "admin@estoque.com",
        "senha": "admin123",
        "role": "admin",
    },
    {
        "nome": "Operador Padrão",
        "email": "operador@estoque.com",
        "senha": "operador123",
        "role": "operador",
    },
]

CATEGORIAS = ["Vestuário", "Papelaria", "Acessórios", "Alimentos"]
PRODUTOS = [
    ("Camiseta SENAI", 35.0, 18, "M", "Vestuário"),
    ("Camiseta AAPM", 30.0, 12, "G", "Vestuário"),
    ("Moletom SENAI", 89.9, 8, "GG", "Vestuário"),
    ("Boné Institucional", 29.9, 15, None, "Acessórios"),
    ("Caderno Universitário", 18.5, 25, None, "Papelaria"),
    ("Caneta Azul", 3.5, 60, None, "Papelaria"),
    ("Lápis HB", 2.0, 48, None, "Papelaria"),
    ("Borracha Branca", 2.5, 35, None, "Papelaria"),
    ("Régua 30 cm", 4.0, 22, None, "Papelaria"),
    ("Garrafa Squeeze", 24.9, 14, None, "Acessórios"),
    ("Chaveiro SENAI", 12.0, 30, None, "Acessórios"),
    ("Pasta Escolar", 14.9, 17, None, "Papelaria"),
    ("Café 200 ml", 4.5, 40, None, "Alimentos"),
    ("Água Mineral", 3.0, 55, None, "Alimentos"),
    ("Barra de Cereal", 5.5, 20, None, "Alimentos"),
]
ARMARIOS = [(f"A{numero:02d}", "Bloco A - Térreo") for numero in range(1, 13)] + [(f"B{numero:02d}", "Bloco B - 1º andar") for numero in range(1, 13)]


def seed():
    db = SessionLocal()

    try:
        categorias = {}
        for nome in CATEGORIAS:
            categoria = db.query(Categoria).filter(Categoria.nome == nome).first()
            if not categoria:
                categoria = Categoria(nome=nome)
                db.add(categoria)
                db.flush()
            categorias[nome] = categoria

        for nome, preco, estoque, variacao, categoria_nome in PRODUTOS:
            if db.query(Produto).filter(Produto.nome == nome).first():
                continue
            db.add(Produto(
                nome=nome, preco=preco, estoque_atual=estoque, variacao=variacao,
                categoria_id=categorias[categoria_nome].id,
                imagem_path="uploads/camisa-senai.jpg" if "SENAI" in nome else None,
            ))

        for numero, localizacao in ARMARIOS:
            if not db.query(Armario).filter(Armario.numero == numero).first():
                db.add(Armario(numero=numero, localizacao=localizacao))
        for dados in USUARIOS:
            # Verifica se o usuário já existe para não duplicar ao rodar o script mais de uma vez
            existente = db.query(Usuario).filter(
                Usuario.email == dados["email"]
            ).first()

            if existente:
                print(f"[SKIP]  {dados['email']} — já existe no banco")
                continue

            usuario = Usuario(
                nome=dados["nome"],
                email=dados["email"],
                senha_hash=hash_senha(dados["senha"]),  # nunca salvar senha pura
                role=dados["role"],
            )

            db.add(usuario)
            print(f"[OK]    {dados['email']} criado com role '{dados['role']}'")

        db.commit()
        print("\nSeed concluído!")

    except Exception as e:
        db.rollback()  # desfaz tudo se algo der errado
        print(f"[ERRO] {e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
