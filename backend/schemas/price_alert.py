from pydantic import BaseModel, Field


class PriceAlertCreate(BaseModel):
    commodity_id: int = Field(..., gt=0)
    commodity_name: str = Field(..., min_length=2, max_length=100)
    state_id: int = Field(..., gt=0)
    market_id: int = Field(..., gt=0)
    market_name: str = Field(..., min_length=2, max_length=100)
    target_price: float = Field(..., gt=0)
    condition: str = Field(..., pattern="^(above|below)$")