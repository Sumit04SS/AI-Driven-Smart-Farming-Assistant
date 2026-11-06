from backend.database import SessionLocal
from backend.models.equipment import Equipment
from backend.models.rental_request import RentalRequest


def create_rental_request(equipment_id: int, renter_id: int):
    db = SessionLocal()

    try:
        equipment = (
            db.query(Equipment)
            .filter(
                Equipment.id == equipment_id,
                Equipment.available.is_(True),
            )
            .first()
        )

        if not equipment:
            raise ValueError("Equipment is not available for rental.")

        if equipment.owner_id == renter_id:
            raise ValueError("You cannot request your own equipment.")

        rental_request = RentalRequest(
            equipment_id=equipment_id,
            renter_id=renter_id,
            status="pending",
        )

        db.add(rental_request)
        db.commit()
        db.refresh(rental_request)

        return rental_request

    finally:
        db.close()

def update_rental_request(
    request_id: int,
    owner_id: int,
    status: str,
):
    db = SessionLocal()

    try:
        rental_request = (
            db.query(RentalRequest)
            .filter(RentalRequest.id == request_id)
            .first()
        )

        if not rental_request:
            raise ValueError("Rental request not found.")

        equipment = (
            db.query(Equipment)
            .filter(Equipment.id == rental_request.equipment_id)
            .first()
        )

        if not equipment or equipment.owner_id != owner_id:
            raise ValueError("You are not the owner of this equipment.")

        if status not in {"accepted", "rejected"}:
            raise ValueError("Invalid request status.")

        rental_request.status = status
        db.commit()
        db.refresh(rental_request)

        return rental_request

    finally:
        db.close()

def get_rental_requests(user_id: int):
    db = SessionLocal()

    try:
        requests = (
            db.query(RentalRequest, Equipment)
            .join(
                Equipment,
                Equipment.id == RentalRequest.equipment_id,
            )
            .filter(
                (RentalRequest.renter_id == user_id)
                | (Equipment.owner_id == user_id)
            )
            .all()
        )

        return [
            {
                "request_id": rental_request.id,
                "equipment_id": equipment.id,
                "equipment_type": equipment.equipment_type,
                "brand": equipment.brand,
                "model": equipment.model,
                "rental_price_per_day": equipment.rental_price_per_day,
                "status": rental_request.status,
                "created_at": rental_request.created_at,
            }
            for rental_request, equipment in requests
        ]

    finally:
        db.close()