from pydantic import BaseModel, Field


class FarmAdvisorRequest(BaseModel):
    crop: str = Field(..., min_length=2, max_length=100)
    crop_stage: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=2)

    nitrogen: float = Field(..., ge=0)
    phosphorus: float = Field(..., ge=0)
    potassium: float = Field(..., ge=0)
    ph: float = Field(..., ge=0, le=14)