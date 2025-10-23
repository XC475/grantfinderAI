"""Changed category column to enum type

Revision ID: cca5d59cab30
Revises: 1f57155ad91e
Create Date: 2025-10-22 23:23:02.648535

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'cca5d59cab30'
down_revision = '1f57155ad91e'
branch_labels = None
depends_on = None


def upgrade():
    
    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        # Drop the category column
        batch_op.drop_column('category')

def downgrade():
 
    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('category', sa.Text(), nullable=True))
