"""Restaurar preco e estoque dos produtos para o modelo atual.

Revision ID: b7f93d12a4c0
Revises: a6ddaa3a9f1d
"""

from alembic import op
import sqlalchemy as sa


revision = "b7f93d12a4c0"
down_revision = "a6ddaa3a9f1d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # A migração anterior moveu esses dados para variações; o modelo atual
    # voltou a manter preço e estoque diretamente no produto.
    with op.batch_alter_table("produtos") as batch_op:
        batch_op.add_column(sa.Column("preco", sa.Float(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("estoque_atual", sa.Integer(), nullable=False, server_default="0"))

    # Preserva os valores quando a base possuir variações cadastradas.
    op.execute(
        """
        UPDATE produtos
        SET preco = COALESCE(
                (SELECT MIN(preco) FROM produto_variacoes
                 WHERE produto_variacoes.produto_id = produtos.id
                   AND produto_variacoes.ativo = 1),
                0
            ),
            estoque_atual = COALESCE(
                (SELECT SUM(estoque_atual) FROM produto_variacoes
                 WHERE produto_variacoes.produto_id = produtos.id
                   AND produto_variacoes.ativo = 1),
                0
            )
        """
    )

    with op.batch_alter_table("movimentacoes") as batch_op:
        batch_op.alter_column("criando_em", new_column_name="criado_em")


def downgrade() -> None:
    with op.batch_alter_table("movimentacoes") as batch_op:
        batch_op.alter_column("criado_em", new_column_name="criando_em")

    with op.batch_alter_table("produtos") as batch_op:
        batch_op.drop_column("estoque_atual")
        batch_op.drop_column("preco")
