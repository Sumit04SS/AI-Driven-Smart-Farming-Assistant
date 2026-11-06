from fastapi import APIRouter, Depends

from backend.core.security import get_current_user
from backend.schemas.crop_recommendation import CropRecommendationRequest
from backend.services.crop_recommendation_service import recommend_crop


router = APIRouter(
    prefix="/api/crop-recommendation",
    tags=["Crop Recommendation"]
)


@router.post("")
def crop_recommendation(
    request: CropRecommendationRequest,
    current_user=Depends(get_current_user),
):
    result = recommend_crop(
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        temperature=request.temperature,
        humidity=request.humidity,
        ph=request.ph,
        rainfall=request.rainfall,
    )

    return {
        "status": "success",
        **result,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
        },
    }