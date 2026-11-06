from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from backend.database import Base


class RentalRequest(Base):
    __tablename__ = "rental_requests"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(
        Integer,
        ForeignKey("equipment.id"),
        nullable=False,
        index=True,
    )
    renter_id = Column(Integer, nullable=False, index=True)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)