from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from backend.database import Base


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    commodity_id = Column(Integer, nullable=False)
    commodity_name = Column(String, nullable=False)
    market_id = Column(Integer, nullable=False)
    state_id = Column(Integer, nullable=False)
    market_name = Column(String, nullable=False)
    target_price = Column(Float, nullable=False)
    condition = Column(String, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    triggered = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)