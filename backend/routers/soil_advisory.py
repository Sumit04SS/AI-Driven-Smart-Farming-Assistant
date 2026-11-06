from fastapi import APIRouter, Depends

from backend.core.security import get_current_user
from backend.schemas.soil_advisory import SoilAdvisoryRequest
from backend.services.soil_advisory_service import analyze_soil


router = APIRouter(
    prefix="/api/soil-advisory",
    tags=["Soil Advisory"]
)


@router.post("")
def soil_advisory(
    request: SoilAdvisoryRequest,
    current_user=Depends(get_current_user),
):
    result = analyze_soil(
        crop=request.crop,
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        ph=request.ph,
    )

    return {
        "status": "success",
        **result,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
        },
    }