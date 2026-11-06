from fastapi import APIRouter, HTTPException, Query, Depends

from backend.core.security import get_current_user
from backend.database import SessionLocal
from backend.models.price_alert import PriceAlert
from backend.schemas.price_alert import PriceAlertCreate

from backend.services.price_alert_service import (
    create_price_alert,
    check_price_alert,
    get_user_price_alerts,
    deactivate_price_alert,
)

from backend.services.market_service import (
    get_market_prices,
    get_market_states,
    get_markets_by_state,
    get_market_commodities,
)


router = APIRouter(
    prefix="/api/market",
    tags=["Market Prices"]
)


@router.get("/states")
def market_states():
    try:
        return {
            "status": "success",
            "source": "AGMARKNET",
            "states": get_market_states(),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve market states."
        )


@router.get("/markets")
def markets_by_state(
    state_id: int = Query(..., ge=1),
):
    try:
        return {
            "status": "success",
            "source": "AGMARKNET",
            "state_id": state_id,
            "markets": get_markets_by_state(state_id),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve markets."
        )


@router.get("/commodities")
def market_commodities():
    try:
        return {
            "status": "success",
            "source": "AGMARKNET",
            "commodities": get_market_commodities(),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve commodities."
        )


@router.get("/prices")
def market_prices(
    commodity_id: int = Query(..., ge=1),
    state_id: int = Query(..., ge=1),
    market_id: int = Query(..., ge=1),
):
    try:
        data = get_market_prices(
            commodity_id=commodity_id,
            state_id=state_id,
            market_id=market_id,
        )

        return {
            "status": "success",
            "source": "AGMARKNET",
            "filters": {
                "commodity_id": commodity_id,
                "state_id": state_id,
                "market_id": market_id,
            },
            "market_data": data,
        }

    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve market price information."
        )


@router.post("/price-alert")
def create_alert(
    request: PriceAlertCreate,
    current_user=Depends(get_current_user),
):
    alert = create_price_alert(
        user_id=current_user.id,
        commodity_id=request.commodity_id,
        commodity_name=request.commodity_name,
        market_id=request.market_id,
        market_name=request.market_name,
        target_price=request.target_price,
        condition=request.condition,
        state_id=request.state_id,
    )

    return {
        "status": "success",
        "message": "Price alert created successfully.",
        "alert": {
            "id": alert.id,
            "commodity": alert.commodity_name,
            "market": alert.market_name,
            "target_price": alert.target_price,
            "condition": alert.condition,
            "active": alert.active,
            "triggered": alert.triggered,
        },
    }


@router.get("/price-alerts")
def get_my_price_alerts(
    current_user=Depends(get_current_user),
):
    alerts = get_user_price_alerts(current_user.id)

    return {
        "status": "success",
        "alerts": [
            {
                "id": alert.id,
                "commodity": alert.commodity_name,
                "market": alert.market_name,
                "target_price": alert.target_price,
                "condition": alert.condition,
                "active": alert.active,
                "triggered": alert.triggered,
                "created_at": alert.created_at,
            }
            for alert in alerts
        ],
    }

@router.delete("/price-alert/{alert_id}")
def deactivate_alert(
    alert_id: int,
    current_user=Depends(get_current_user),
):
    alert = deactivate_price_alert(
        alert_id=alert_id,
        user_id=current_user.id,
    )

    if not alert:
        return {
            "status": "error",
            "message": "Price alert not found or not owned by you.",
        }

    return {
        "status": "success",
        "message": "Price alert deactivated successfully.",
        "alert": {
            "id": alert.id,
            "commodity": alert.commodity_name,
            "market": alert.market_name,
            "active": alert.active,
            "triggered": alert.triggered,
        },
    }


@router.post("/price-alert/{alert_id}/check")
def check_alert(
    alert_id: int,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:
        alert = (
            db.query(PriceAlert)
            .filter(PriceAlert.id == alert_id)
            .first()
        )

        if not alert:
            return {
                "status": "error",
                "message": "Price alert not found.",
            }

        if alert.user_id != current_user.id:
            return {
                "status": "error",
                "message": "You are not authorized to check this alert.",
            }

    finally:
        db.close()

    try:
        alert, triggered = check_price_alert(alert_id)
    except ValueError as e:
        return {
            "status": "error",
            "message": str(e),
        }

    return {
        "status": "success",
        "triggered": triggered,
        "message": (
            f"{alert.commodity_name} price has reached your target price."
            if triggered
            else f"{alert.commodity_name} price has not reached your target price yet."
        ),
    }