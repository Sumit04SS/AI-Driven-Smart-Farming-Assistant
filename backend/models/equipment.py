from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from backend.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(Integer, nullable=False, index=True)

    equipment_type = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)

    rental_price_per_day = Column(Float, nullable=False)

    city = Column(String, nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    available = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )