from pydantic import BaseModel, Field


class SoilAdvisoryRequest(BaseModel):

    crop: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    nitrogen: float = Field(
        ...,
        ge=0
    )

    phosphorus: float = Field(
        ...,
        ge=0
    )

    potassium: float = Field(
        ...,
        ge=0
    )

    ph: float = Field(
        ...,
        ge=0,
        le=14
    )