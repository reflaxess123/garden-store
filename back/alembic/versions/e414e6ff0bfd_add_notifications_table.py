"""add_notifications_table

Revision ID: e414e6ff0bfd
Revises: 31ff11143f63
Create Date: 2025-06-20 16:53:22.452621

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e414e6ff0bfd'
down_revision: Union[str, None] = '31ff11143f63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('notification_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['public.profiles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('notifications', schema='public')
