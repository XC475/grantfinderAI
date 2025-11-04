"""Create k12_education_opportunities table

Revision ID: 7fee2305f8af
Revises: 3b5975f4e5aa
Create Date: 2025-11-03 20:11:37.254333

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7fee2305f8af'
down_revision = '3b5975f4e5aa'
branch_labels = None
depends_on = None


def upgrade():
    # Create the opportunity_services_enum
    opportunity_services_enum = postgresql.ENUM('k12_education', 'higher_education', name='opportunity_services_enum', create_type=False)
    opportunity_services_enum.create(op.get_bind(), checkfirst=True)
    
    # Reference the existing k12_education_opportunity_category_enum (created via Supabase UI)
    k12_category_enum = postgresql.ENUM(
        'stem_education', 'math_and_science_education', 'career_and_technical_education', 
        'special_education', 'early_childhood_education', 'teacher_professional_development', 
        'leadership_and_administration_development', 'social_emotional_learning', 
        'school_climate_and_culture', 'bullying_prevention', 'school_safety_and_security', 
        'digital_literacy_and_technology', 'educational_technology_innovation', 
        'after_school_programs', 'arts_and_music_education', 'environmental_education', 
        'health_and_wellness', 'nutrition_and_school_meals', 'student_mental_health', 
        'equity_and_inclusion', 'community_engagement', 'parental_involvement', 
        'college_and_career_readiness', 'civic_and_history_education', 
        'english_language_learners', 'financial_literacy', 'educational_research_and_innovation', 
        'facilities_and_infrastructure', 'data_and_assessment_initiatives', 
        'transportation_and_accessibility', 'other', 
        name='k12_education_opportunity_category_enum', 
        create_type=False  # Don't create since it already exists
    )
    
    # Create the k12_education_opportunities table
    op.create_table('k12_education_opportunities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('opportunity_id', sa.Integer(), nullable=False),
        sa.Column('description_summary', sa.String(), nullable=True),
        sa.Column('category', postgresql.ARRAY(k12_category_enum), nullable=False),
        sa.Column('eligibility_summary', sa.String(), nullable=True),
        sa.Column('relevance_score', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Add services column to opportunities table
    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        batch_op.add_column(sa.Column('services', postgresql.ARRAY(opportunity_services_enum), nullable=True))


def downgrade():
    # Drop the services column from opportunities table
    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        batch_op.drop_column('services')

    # Drop the k12_education_opportunities table
    op.drop_table('k12_education_opportunities')
    
    # Drop the opportunity_services_enum (but leave k12_education_opportunity_category_enum since it was created via UI)
    opportunity_services_enum = postgresql.ENUM(name='opportunity_services_enum')
    opportunity_services_enum.drop(op.get_bind(), checkfirst=True)
    # Note: Not dropping k12_education_opportunity_category_enum as it was created via Supabase UI
