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


class OpportunityStatusEnum(str, PyEnum):
    forecasted = "forecasted"
    posted = "posted"
    closed = "closed"
    archive = "archive"


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False)
    state_code = Column(String)  # e.g. "MA" for Massachusetts, US for federal
    source_grant_id = Column(String, nullable=False)  # ID from the source system
    status = Column(
        Enum(OpportunityStatusEnum, name="opportunity_status_enum"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text)  # Raw description text
    description_summary = Column(String)  # e.g. Model generated summary
    agency = Column(String)  # Agency awarding the grant
    funding_instrument = Column(String)  # e.g. "Grant", "Cooperative Agreement"
    category = Column(String)  # e.g. "Research", "Education"
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
    contact_name = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    url = Column(String)  # URL to the official grant posting
    attachments = Column(JSON)  # List of attachment URLs or metadata
    extra = Column(JSON)
    relevance_score = Column(Integer)  # 0-100 score of relevance to school districts

    def __repr__(self):
        return f"<Opportunity {self.id} {self.title}>"
