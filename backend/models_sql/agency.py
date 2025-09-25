from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from flask_server.db import db
from .opportunity import opportunity_agency  # import the updated association table

class Agency(db.Model):
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
