from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    Column,
    String,
    Date,
    Integer,
    Text,
    Boolean,
)
from flask_server.db import db
from enum import Enum as PyEnum
import sqlalchemy.dialects.postgresql as pg


class OpportunityStatusEnum(str, PyEnum):
    forecasted = "forecasted"
    posted = "posted"
    closed = "closed"
    archive = "archive"


class FundingTypeEnum(str, PyEnum):
    state = "state"
    federal = "federal"
    local = "local"
    private = "private"


class OpportunityCategoryEnum(str, PyEnum):
    STEM_Education = "STEM_Education"
    Math_and_Science_Education = "Math_and_Science_Education"
    Career_and_Technical_Education = "Career_and_Technical_Education"
    Special_Education = "Special_Education"
    Early_Childhood_Education = "Early_Childhood_Education"
    Teacher_Professional_Development = "Teacher_Professional_Development"
    Leadership_and_Administration_Development = (
        "Leadership_and_Administration_Development"
    )
    Social_Emotional_Learning = "Social_Emotional_Learning"
    School_Climate_and_Culture = "School_Climate_and_Culture"
    Bullying_Prevention = "Bullying_Prevention"
    School_Safety_and_Security = "School_Safety_and_Security"
    Digital_Literacy_and_Technology = "Digital_Literacy_and_Technology"
    Educational_Technology_Innovation = "Educational_Technology_Innovation"
    After_School_Programs = "After_School_Programs"
    Arts_and_Music_Education = "Arts_and_Music_Education"
    Environmental_Education = "Environmental_Education"
    Health_and_Wellness = "Health_and_Wellness"
    Nutrition_and_School_Meals = "Nutrition_and_School_Meals"
    Student_Mental_Health = "Student_Mental_Health"
    Equity_and_Inclusion = "Equity_and_Inclusion"
    Community_Engagement = "Community_Engagement"
    Parental_Involvement = "Parental_Involvement"
    College_and_Career_Readiness = "College_and_Career_Readiness"
    Civic_and_History_Education = "Civic_and_History_Education"
    English_Language_Learners = "English_Language_Learners"
    Financial_Literacy = "Financial_Literacy"
    Educational_Research_and_Innovation = "Educational_Research_and_Innovation"
    Facilities_and_Infrastructure = "Facilities_and_Infrastructure"
    Data_and_Assessment_Initiatives = "Data_and_Assessment_Initiatives"
    Transportation_and_Accessibility = "Transportation_and_Accessibility"
    Other = "Other"


class OpportunityServicesEnum(str, PyEnum):
    k12_education = "k12_education"
    higher_education = "higher_education"


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False)
    state_code = Column(String)  # e.g. "MA" for Massachusetts, US for federal
    source_grant_id = Column(String)  # ID from the source system
    status = Column(
        Enum(OpportunityStatusEnum, name="opportunity_status_enum"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text)  # Raw description text
    description_summary = Column(String)  # e.g. Model generated summary
    agency = Column(String)  # Agency awarding the grant
    funding_instrument = Column(String)  # e.g. "Grant", "Cooperative Agreement"
    category = Column(
        pg.ARRAY(Enum(OpportunityCategoryEnum, name="opportunity_category_enum")),
        nullable=True,
    )
    fiscal_year = Column(Integer)
    post_date = Column(Date)
    close_date = Column(Date)
    archive_date = Column(Date)
    cost_sharing = Column(Boolean, default=False)  # Whether cost sharing is required
    award_max = Column(Integer)
    award_min = Column(Integer)
    total_funding_amount = Column(Integer)
    eligibility = Column(Text)  # Raw eligibility text
    eligibility_summary = Column(String)  # e.g. Model generated summary
    last_updated = Column(DateTime)
    funding_type = Column(Enum(FundingTypeEnum, name="funding_type_enum"))
    contact_name = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    url = Column(String)  # URL to the official grant posting
    attachments = Column(JSON)  # List of attachment URLs or metadata
    extra = Column(JSON)
    relevance_score = Column(Integer)  # 0-100 score of relevance to school districts
    raw_text = Column(Text)  # Full raw text of the grant posting for vectorization
    content_hash = Column(String)  # Hash of the main content div for change detection
    rfp_url = Column(String)  # URL to the RFP document if available
    services = Column(
        pg.ARRAY(Enum(OpportunityServicesEnum, name="opportunity_services_enum"))
    )

    def __repr__(self):
        return f"<Opportunity {self.id} {self.title}>"
