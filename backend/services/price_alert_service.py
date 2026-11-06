from backend.database import SessionLocal
from backend.models.price_alert import PriceAlert
from backend.models.notification import Notification

from backend.services.market_service import get_market_prices


def create_price_alert(
    user_id: int,
    commodity_id: int,
    commodity_name: str,
    market_id: int,
    market_name: str,
    target_price: float,
    condition: str,
    state_id: int,
):
    db = SessionLocal()

    try:
        alert = PriceAlert(
            user_id=user_id,
            commodity_id=commodity_id,
            commodity_name=commodity_name,
            market_id=market_id,
            market_name=market_name,
            target_price=target_price,
            condition=condition,
            state_id=state_id,
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    finally:
        db.close()


def check_price_alert(alert_id: int):
    db = SessionLocal()

    try:
        alert = (
            db.query(PriceAlert)
            .filter(PriceAlert.id == alert_id)
            .first()
        )

        if not alert:
            raise ValueError("Price alert not found.")

        if not alert.active or alert.triggered:
            return alert, False

        result = get_market_prices(
            commodity_id=alert.commodity_id,
            state_id=alert.state_id,
            market_id=alert.market_id,
        )

        prices = result.get("prices", [])

        if not prices:
            return alert, False

        latest_price = float(prices[0]["price"])

        if alert.condition == "above":
            reached = latest_price >= alert.target_price
        else:
            reached = latest_price <= alert.target_price

        if reached:
            alert.triggered = True

            notification = Notification(
                user_id=alert.user_id,
                title="Price Alert",
                message=(
                    f"{alert.commodity_name} price has reached "
                    f"your target price."
                ),
                notification_type="price_alert",
                is_read=False,
            )

            db.add(notification)
            db.commit()
            db.refresh(alert)

        return alert, reached

    finally:
        db.close()


def get_user_price_alerts(user_id: int):
    db = SessionLocal()

    try:
        alerts = (
            db.query(PriceAlert)
            .filter(PriceAlert.user_id == user_id)
            .order_by(PriceAlert.created_at.desc())
            .all()
        )

        return alerts

    finally:
        db.close()


def deactivate_price_alert(alert_id: int, user_id: int):
    db = SessionLocal()

    try:
        alert = (
            db.query(PriceAlert)
            .filter(
                PriceAlert.id == alert_id,
                PriceAlert.user_id == user_id,
            )
            .first()
        )

        if not alert:
            return None

        alert.active = False

        db.commit()
        db.refresh(alert)

        return alert

    finally:
        db.close()