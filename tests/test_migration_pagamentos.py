"""Exercise upgrade/downgrade only against a temporary in-memory database."""
import importlib.util
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from alembic.migration import MigrationContext
from alembic.operations import Operations


def test_migracao_pagamentos_preserva_vendas_antigas():
    path=Path(__file__).resolve().parents[1]/'migrations/versions/e4f5a6b7c8d9_salvar_pagamentos_vendas.py'
    spec=importlib.util.spec_from_file_location('migration_payments_test',path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    engine=create_engine('sqlite:///:memory:')
    try:
        with engine.begin() as connection:
            connection.execute(text('CREATE TABLE vendas (id INTEGER PRIMARY KEY, total_liquido FLOAT)'))
            connection.execute(text('INSERT INTO vendas VALUES (1, 10.5)'))
            with Operations.context(MigrationContext.configure(connection)):
                module.upgrade()
            assert 'pagamentos' in {column['name'] for column in inspect(connection).get_columns('vendas')}
            assert connection.execute(text('SELECT id,total_liquido,pagamentos FROM vendas')).one()==(1,10.5,None)
            with Operations.context(MigrationContext.configure(connection)):
                module.downgrade()
            assert 'pagamentos' not in {column['name'] for column in inspect(connection).get_columns('vendas')}
            assert connection.execute(text('SELECT id,total_liquido FROM vendas')).one()==(1,10.5)
    finally:
        engine.dispose()
