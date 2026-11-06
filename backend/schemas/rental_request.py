from pydantic import BaseModel, Field


class RentalRequestCreate(BaseModel):
    equipment_id: int = Field(..., gt=0)