from fastapi import FastAPI, Depends
from backend.routers import equipment
from backend.routers.auth import router as auth_router
from backend.routers.rag import router as rag_router
from backend.core.security import get_current_user
from backend.routers.market import router as market_router
from backend.routers.users import router as users_router
from backend.routers.history import router as history_router
from backend.routers.weather import router as weather_router
from backend.routers import weather
from backend.routers import crop_recommendation
from backend.routers import soil_advisory
from backend.routers.notifications import router as notifications_router
from backend.routers.multilingual import router as multilingual_router
from apscheduler.schedulers.background import BackgroundScheduler
from backend.services.price_alert_scheduler import check_active_price_alerts
from backend.routers import (
    auth,
    rag,
    market,
    users,
    history,
    weather,
    crop_recommendation,
    soil_advisory,
    farm_advisor,
    multilingual,
)


app = FastAPI(
    title="Smart Farming Assistant API",
    description="Backend API for the AI-driven agriculture assistant",
    version="1.0.0"
)

scheduler = BackgroundScheduler()

scheduler.add_job(
    check_active_price_alerts,
    "interval",
    minutes=30,
)

scheduler.start()


app.include_router(auth_router)
app.include_router(rag_router)
app.include_router(multilingual_router)
app.include_router(market_router)
app.include_router(users_router)
app.include_router(history_router)
app.include_router(weather_router)
app.include_router(crop_recommendation.router)
app.include_router(soil_advisory.router)
app.include_router(farm_advisor.router)
app.include_router(equipment.router)
app.include_router(notifications_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "message": "Smart Farming Assistant API is running"
    }


@app.get("/api/test-protected")
def test_protected(
    current_user=Depends(get_current_user)
):
    return {
        "status": "success",
        "message": "You are authenticated",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }