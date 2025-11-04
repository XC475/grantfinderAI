from sqlalchemy import (
    Enum,
    Column,
    String,
    Integer,
    ForeignKey,
)
from flask_server.db import db
from enum import Enum as PyEnum
import sqlalchemy.dialects.postgresql as pg


class K12EducationOpportunityCategoryEnum(str, PyEnum):
    stem_education = "stem_education"
    math_and_science_education = "math_and_science_education"
    career_and_technical_education = "career_and_technical_education"
    special_education = "special_education"
    early_childhood_education = "early_childhood_education"
    teacher_professional_development = "teacher_professional_development"
    leadership_and_administration_development = (
        "leadership_and_administration_development"
    )
    social_emotional_learning = "social_emotional_learning"
    school_climate_and_culture = "school_climate_and_culture"
    bullying_prevention = "bullying_prevention"
    school_safety_and_security = "school_safety_and_security"
    digital_literacy_and_technology = "digital_literacy_and_technology"
    educational_technology_innovation = "educational_technology_innovation"
    after_school_programs = "after_school_programs"
    arts_and_music_education = "arts_and_music_education"
    environmental_education = "environmental_education"
    health_and_wellness = "health_and_wellness"
    nutrition_and_school_meals = "nutrition_and_school_meals"
    student_mental_health = "student_mental_health"
    equity_and_inclusion = "equity_and_inclusion"
    community_engagement = "community_engagement"
    parental_involvement = "parental_involvement"
    college_and_career_readiness = "college_and_career_readiness"
    civic_and_history_education = "civic_and_history_education"
    english_language_learners = "english_language_learners"
    financial_literacy = "financial_literacy"
    educational_research_and_innovation = "educational_research_and_innovation"
    facilities_and_infrastructure = "facilities_and_infrastructure"
    data_and_assessment_initiatives = "data_and_assessment_initiatives"
    transportation_and_accessibility = "transportation_and_accessibility"
    other = "other"


class K12EducationOpportunity(db.Model):
    __tablename__ = "k12_education_opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    opportunity_id = Column(
        Integer,
        ForeignKey("opportunities.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    description_summary = Column(String)  # e.g. Model generated summary
    category = Column(
        pg.ARRAY(
            Enum(
                K12EducationOpportunityCategoryEnum,
                name="k12_education_opportunity_category_enum",
            )
        ),
        nullable=False,
    )
    eligibility_summary = Column(String)  # e.g. Model generated summary
    relevance_score = Column(Integer)  # 0-100 score of relevance to school districts

    def __repr__(self):
        return f"<K-12 Opportunity {self.id} {self.title}>"
