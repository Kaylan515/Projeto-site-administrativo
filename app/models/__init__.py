from app.models import categoria
from app.models import produto
from app.models import usuario
from app.models import movimentacao
from app.models import cliente
from app.models import venda

# Importar ProdutoVariacao para registro no banco

# Gerar a migration:
# python -m alembic revision --autogenerate -m "Adicionar suporte a variações de produtos"

# Aplicar migração:
# python -m alembic upgrade head
