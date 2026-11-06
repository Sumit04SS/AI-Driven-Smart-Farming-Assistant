from backend.database import SessionLocal
from backend.models.equipment import Equipment


def create_equipment(
    owner_id: int,
    equipment_type: str,
    brand: str | None,
    model: str | None,
    rental_price_per_day: float,
    city: str,
    latitude: float | None,
    longitude: float | None,
    available: bool,
):
    db = SessionLocal()

    try:
        equipment = Equipment(
            owner_id=owner_id,
            equipment_type=equipment_type,
            brand=brand,
            model=model,
            rental_price_per_day=rental_price_per_day,
            city=city,
            latitude=latitude,
            longitude=longitude,
            available=available,
        )

        db.add(equipment)
        db.commit()
        db.refresh(equipment)

        return equipment

    finally:
        db.close()


def search_equipment(
    equipment_type: str,
    city: str,
):
    db = SessionLocal()

    try:
        results = (
            db.query(Equipment)
            .filter(
                Equipment.equipment_type.ilike(equipment_type),
                Equipment.city.ilike(city),
                Equipment.available.is_(True),
            )
            .all()
        )

        return results

    finally:
        db.close()