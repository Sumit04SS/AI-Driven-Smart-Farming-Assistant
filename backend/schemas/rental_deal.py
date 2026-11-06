from pydantic import BaseModel, Field


class RentalDealRequest(BaseModel):
    equipment_id: int = Field(..., gt=0)
    rental_days: int = Field(..., gt=0)
    alternative_cost: float = Field(..., ge=0)