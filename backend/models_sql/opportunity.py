from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON, DateTime, Enum, Column, String, Date, Integer, Text, ForeignKey, Table, null
from sqlalchemy.orm import relationship
from flask_server.db import db
from enum import Enum as PyEnum

# --- Association tables for many-to-many relationships ---
opportunity_agency = Table(
    "opportunity_agency",
    db.Model.metadata,  # use db.Model.metadata
    Column("opportunity_id", ForeignKey("opportunities.id"), primary_key=True),
    Column("agency_id", ForeignKey("agencies.id"), primary_key=True),
)

opportunity_cfda = Table(
    "opportunity_cfda",
    db.Model.metadata,
    Column("opportunity_id", ForeignKey("opportunities.id"), primary_key=True),
    Column("cfda_id", ForeignKey("cfda_programs.id"), primary_key=True),
)

class OpportunityStatusEnum(str, PyEnum):
    forecasted = "forecasted"
    posted = "posted"
    closed = "closed"
    archive = "archive"

class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False)
    state_code = Column(String)
    opportunity_number = Column(String, nullable=False)
    status = Column(
        Enum(OpportunityStatusEnum, name="opportunity_status_enum"),
        nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    fiscal_year = Column(Integer)
    post_date = Column(Date)
    est_post_date = Column(Date)
    close_date = Column(Date)
    award_date = Column(Date)
    award_ceiling = Column(Integer)
    award_floor = Column(Integer)
    total_funding_amount = Column(Integer)
    number_of_awards = Column(Integer)
    eligibility = Column(Text)
    last_updated = Column(DateTime)
    contact_name = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    version = Column(Integer)
    url = Column(String)
    extra = Column(JSON)

    # Relationships
    agencies = relationship("Agency", secondary=opportunity_agency, back_populates="opportunities")
    cfda_programs = relationship("CFDAProgram", secondary=opportunity_cfda, back_populates="opportunities")

    def __repr__(self):
        return f"<Opportunity {self.id} {self.title}>"
