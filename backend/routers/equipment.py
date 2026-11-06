from fastapi import APIRouter, Depends
from backend.schemas.rental_request import RentalRequestCreate
from backend.services.rental_request_service import create_rental_request
from backend.schemas.rental_deal import RentalDealRequest
from backend.services.rental_deal_service import check_rental_deal
from backend.services.rental_request_service import update_rental_request

from backend.services.rental_request_service import (
    create_rental_request,
    update_rental_request,
    get_rental_requests,
)

from backend.core.security import get_current_user
from backend.schemas.equipment import (
    EquipmentCreateRequest,
    EquipmentSearchRequest,
)
from backend.services.equipment_service import (
    create_equipment,
    search_equipment,
)


# ==========================================
# ROUTER
# ==========================================

router = APIRouter(
    prefix="/api/equipment",
    tags=["Equipment Rental"],
)


# ==========================================
# ADD EQUIPMENT
# ==========================================

@router.post("/")
def add_equipment(
    request: EquipmentCreateRequest,
    current_user=Depends(get_current_user),
):
    equipment = create_equipment(
        owner_id=current_user.id,
        equipment_type=request.equipment_type,
        brand=request.brand,
        model=request.model,
        rental_price_per_day=request.rental_price_per_day,
        city=request.city,
        latitude=request.latitude,
        longitude=request.longitude,
        available=request.available,
    )

    return {
        "status": "success",
        "message": "Equipment listed for rental successfully.",
        "equipment": {
            "id": equipment.id,
            "equipment_type": equipment.equipment_type,
            "brand": equipment.brand,
            "model": equipment.model,
            "rental_price_per_day": equipment.rental_price_per_day,
            "city": equipment.city,
            "available": equipment.available,
        },
    }


# ==========================================
# SEARCH EQUIPMENT
# ==========================================

@router.post("/search")
def search_available_equipment(
    request: EquipmentSearchRequest,
    current_user=Depends(get_current_user),
):
    results = search_equipment(
        equipment_type=request.equipment_type,
        city=request.city,
    )

    return {
        "status": "success",
        "equipment_type": request.equipment_type,
        "city": request.city,
        "results": [
            {
                "id": item.id,
                "equipment_type": item.equipment_type,
                "brand": item.brand,
                "model": item.model,
                "rental_price_per_day": item.rental_price_per_day,
                "city": item.city,
                "available": item.available,
            }
            for item in results
        ],
    }


# ==========================================
# RENTAL DEAL CHECK
# ==========================================

@router.post("/deal-check")
def rental_deal_check(
    request: RentalDealRequest,
    current_user=Depends(get_current_user),
):
    try:
        result = check_rental_deal(
            equipment_id=request.equipment_id,
            rental_days=request.rental_days,
            alternative_cost=request.alternative_cost,
        )

    except ValueError as e:
        return {
            "status": "error",
            "message": str(e),
        }

    equipment = result["equipment"]

    # --------------------------------------
    # Calculate decision message
    # --------------------------------------

    if result["savings"] > 0:
        message = (
            f"This rental can save you "
            f"₹{result['savings']:.2f} compared "
            "with the alternative option."
        )

    elif result["savings"] < 0:
        message = (
            f"This rental costs "
            f"₹{abs(result['savings']):.2f} more "
            "than the alternative option."
        )

    else:
        message = (
            "This rental is at break-even with "
            "the alternative option."
        )

    # --------------------------------------
    # Final response
    # --------------------------------------

    return {
        "status": "success",

        "equipment": {
            "id": equipment.id,
            "equipment_type": equipment.equipment_type,
            "brand": equipment.brand,
            "model": equipment.model,
            "rental_price_per_day": equipment.rental_price_per_day,
        },

        "calculation": {
            "rental_days": request.rental_days,
            "rental_cost": result["rental_cost"],
            "alternative_cost": result["alternative_cost"],
            "savings": result["savings"],
            "decision": result["decision"],
            "message": message,
        },
    }

@router.post("/rental-request")
def request_rental(
    request: RentalRequestCreate,
    current_user=Depends(get_current_user),
):
    try:
        rental_request = create_rental_request(
            equipment_id=request.equipment_id,
            renter_id=current_user.id,
        )
    except ValueError as e:
        return {
            "status": "error",
            "message": str(e),
        }

    return {
        "status": "success",
        "message": "Rental request sent successfully.",
        "request": {
            "id": rental_request.id,
            "equipment_id": rental_request.equipment_id,
            "status": rental_request.status,
        },
    }

@router.put("/rental-request/{request_id}")
def update_request(
    request_id: int,
    status: str,
    current_user=Depends(get_current_user),
):
    try:
        rental_request = update_rental_request(
            request_id=request_id,
            owner_id=current_user.id,
            status=status,
        )
    except ValueError as e:
        return {
            "status": "error",
            "message": str(e),
        }

    return {
        "status": "success",
        "message": f"Rental request {status} successfully.",
        "request": {
            "id": rental_request.id,
            "equipment_id": rental_request.equipment_id,
            "status": rental_request.status,
        },
    }

@router.get("/rental-requests")
def rental_requests(
    current_user=Depends(get_current_user),
):
    requests = get_rental_requests(current_user.id)

    return {
        "status": "success",
        "requests": requests,
    }