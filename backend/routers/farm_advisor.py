from fastapi import APIRouter, Depends

from backend.core.security import get_current_user
from backend.schemas.farm_advisor import FarmAdvisorRequest
from backend.services.farm_advisor_service import build_farm_actions


router = APIRouter(
    prefix="/api/farm-advisor",
    tags=["Farm Advisor"]
)


@router.post("")
def farm_advisor(
    request: FarmAdvisorRequest,
    current_user=Depends(get_current_user),
):
    result = build_farm_actions(
        crop=request.crop,
        crop_stage=request.crop_stage,
        city=request.city,
        country=request.country,
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