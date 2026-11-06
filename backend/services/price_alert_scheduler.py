from backend.database import SessionLocal
from backend.models.price_alert import PriceAlert
from backend.services.price_alert_service import check_price_alert


def check_active_price_alerts():
    db = SessionLocal()

    try:
        alerts = (
            db.query(PriceAlert)
            .filter(
                PriceAlert.active.is_(True),
                PriceAlert.triggered.is_(False),
            )
            .all()
        )

        for alert in alerts:
            try:
                check_price_alert(alert.id)
            except Exception as e:
                print(f"Price alert {alert.id} check failed: {e}")

    finally:
        db.close()