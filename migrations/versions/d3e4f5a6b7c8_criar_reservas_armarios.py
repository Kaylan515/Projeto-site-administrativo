"""criar reservas de armarios

Revision ID: d3e4f5a6b7c8
Revises: c2e14f8a5b91
"""
from alembic import op
import sqlalchemy as sa

revision = "d3e4f5a6b7c8"
down_revision = "c2e14f8a5b91"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reservas_armarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("armario_id", sa.Integer(), sa.ForeignKey("armarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("locatario_nome", sa.String(length=150), nullable=False),
        sa.Column("semestre", sa.String(length=10), nullable=False),
        sa.Column("observacao", sa.String(length=255)),
        sa.Column("iniciado_em", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("encerrado_em", sa.DateTime()),
    )


def downgrade():
    op.drop_table("reservas_armarios")
