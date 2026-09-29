"""Adicionar tamanho ou variacao operacional ao produto.

Revision ID: c2e14f8a5b91
Revises: b7f93d12a4c0
"""
from alembic import op
import sqlalchemy as sa

revision = "c2e14f8a5b91"
down_revision = "b7f93d12a4c0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("produtos") as batch_op:
        batch_op.add_column(sa.Column("variacao", sa.String(length=80), nullable=True))
        batch_op.create_index("ix_produtos_variacao", ["variacao"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("produtos") as batch_op:
        batch_op.drop_index("ix_produtos_variacao")
        batch_op.drop_column("variacao")
