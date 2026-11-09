"""Save the payment allocation for each sale.

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
"""
from alembic import op
import sqlalchemy as sa

revision = "e4f5a6b7c8d9"
down_revision = "d3e4f5a6b7c8"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("vendas", sa.Column("pagamentos", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("vendas", "pagamentos")
