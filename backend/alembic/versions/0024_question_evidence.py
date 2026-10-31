"""Keep reused-question identity at submission time for study evidence."""
from alembic import op
import sqlalchemy as sa

revision = '0024_question_evidence'
down_revision = '0023_refund_safety'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('result_answers', sa.Column('question_fingerprint', sa.String(64), nullable=True))


def downgrade():
    op.drop_column('result_answers', 'question_fingerprint')
