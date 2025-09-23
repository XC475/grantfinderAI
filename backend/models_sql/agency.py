# backend/models_sql/agency.py
from db import Base
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from .opportunity import opportunity_agency

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    source = Column(String, nullable=False, server_default='grants.gov')

    # Relationships
    opportunities = relationship(
        "Opportunity",
        secondary=opportunity_agency,
        back_populates="agencies"
    )

    def __repr__(self):
        return f"<Agency {self.code} {self.name}>"
