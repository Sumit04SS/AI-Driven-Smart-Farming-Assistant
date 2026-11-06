from backend.database import SessionLocal
from backend.models.equipment import Equipment


def check_rental_deal(
    equipment_id: int,
    rental_days: int,
    alternative_cost: float,
):
    db = SessionLocal()

    try:
        equipment = (
            db.query(Equipment)
            .filter(Equipment.id == equipment_id)
            .first()
        )

        if not equipment:
            raise ValueError("Equipment not found.")

        rental_cost = equipment.rental_price_per_day * rental_days
        savings = alternative_cost - rental_cost

        if savings > 0:
            decision = "suitable"
        elif savings < 0:
            decision = "not_suitable"
        else:
            decision = "break_even"

        return {
            "equipment": equipment,
            "rental_cost": rental_cost,
            "alternative_cost": alternative_cost,
            "savings": savings,
            "decision": decision,
        }

    finally:
        db.close()