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