# Instale o requirements.txt

```bash
pip install -r requirements.txt
```

# Iniciar o alembic
```bash
python -m alembic init migrations
```

# Gerar a migrations
```bash
python -m alembic revision --autogenerate -m "Criar tabela usuarios"
```

# Aplicar a migration
```bash
python -m alembic upgrade head
```

# Como rodar o código:
```bash
python -m uvicorn app.main:app --reload
```

## Testes

Execute a suite a partir da raiz do projeto:

```bash
python -m pytest tests -q -p no:cacheprovider
```

Os testes usam SQLite em memoria e nao modificam o banco `estoque.db`.
A suite cobre autenticacao, permissoes, cadastros, paginacao, estoque,
vendas, pagamentos divididos, confirmacao manual de PIX, QR Code e migracao de pagamentos.

Os testes JavaScript usam o test runner nativo do Node.js, sem dependencias npm.
Instale Node.js 20 ou superior para executa-los junto ao pytest; sem Node, o pytest
informa explicitamente que esses dois grupos foram ignorados. Para executa-los separadamente:

```bash
node --test tests/js/pdv.test.cjs tests/js/navigation.test.cjs
```

Esses testes verificam a logica com DOM simulado. Nao substituem uma conferencia
visual no navegador nem confirmam recebimentos reais no banco; o PIX atual usa
confirmacao manual do operador.
