from pydantic import BaseModel, Field


class EquipmentCreateRequest(BaseModel):
    equipment_type: str = Field(..., min_length=2, max_length=100)
    brand: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)

    rental_price_per_day: float = Field(..., gt=0)

    city: str = Field(..., min_length=2, max_length=100)

    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    available: bool = True



class EquipmentSearchRequest(BaseModel):
    equipment_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    city: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )