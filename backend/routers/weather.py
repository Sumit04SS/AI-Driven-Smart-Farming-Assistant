from fastapi import APIRouter, Query

from backend.services.weather_service import get_weather, get_weather_by_coords


router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"]
)


@router.get("")
def weather(
    city: str = Query(..., min_length=2),
    country: str | None = Query(
        default=None,
        min_length=2,
        max_length=2
    )
):
    try:
        weather_data = get_weather(
            city=city,
            country_code=country
        )

        return {
            "status": "success",
            **weather_data
        }

    except ValueError as e:
        return {
            "status": "error",
            "message": str(e)
        }

    except RuntimeError as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/by-coords")
def weather_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """Fetch weather for a given latitude/longitude (used by geolocation)."""
    try:
        weather_data = get_weather_by_coords(
            latitude=lat,
            longitude=lon
        )

        return {
            "status": "success",
            **weather_data
        }

    except RuntimeError as e:
        return {
            "status": "error",
            "message": str(e)
        }