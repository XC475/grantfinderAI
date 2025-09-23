# backend/models_sql/cfda_program.py

from db import Base
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from .opportunity import opportunity_cfda  # make sure this imports the updated association table

class CFDAProgram(Base):
    __tablename__ = "cfda_programs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    number = Column(String, unique=True, nullable=False)  # e.g. "93.123"
    title = Column(String, nullable=False)

    # Relationships
    opportunities = relationship(
        "Opportunity",
        secondary=opportunity_cfda,
        back_populates="cfda_programs"
    )

    def __repr__(self):
        return f"<CFDAProgram {self.number} {self.title}>"
