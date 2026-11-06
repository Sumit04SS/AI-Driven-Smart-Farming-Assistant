import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
)

_session = requests.Session()
_retry_strategy = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
)
_adapter = HTTPAdapter(max_retries=_retry_strategy)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)

HEADERS = {
    "User-Agent": "AgriSmart-SmartFarming/1.0 (Mozilla/5.0; Windows NT 10.0; Win64; x64)",
    "Accept": "application/json",
}


def get_weather(
    city: str,
    country_code: str | None = None,
    forecast_days: int = 3
):
    # ---------------------------------------------
    # 1. Find city coordinates
    # ---------------------------------------------

    geocoding_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    if country_code:
        geocoding_params["countryCode"] = country_code.upper()

    try:
        geocoding_response = _session.get(
            GEOCODING_URL,
            params=geocoding_params,
            headers=HEADERS,
            timeout=(10, 30)
        )

        geocoding_response.raise_for_status()

    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Weather location search timed out."
        )

    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"Weather location search failed: {e}"
        )

    locations = geocoding_response.json().get(
        "results",
        []
    )

    if not locations:
        raise ValueError(
            f"Location not found: {city}"
        )

    location = locations[0]

    latitude = location["latitude"]
    longitude = location["longitude"]

    # ---------------------------------------------
    # 2. Get weather
    # ---------------------------------------------

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation_probability,"
            "precipitation,"
            "rain,"
            "wind_speed_10m"
        ),

        "forecast_days": forecast_days,
        "timezone": "auto"
    }

    try:
        weather_response = _session.get(
            WEATHER_URL,
            params=weather_params,
            headers=HEADERS,
            timeout=(10, 30)
        )

        weather_response.raise_for_status()

    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Weather API request timed out."
        )

    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"Weather API request failed: {e}"
        )

    weather = weather_response.json()

    # ---------------------------------------------
    # 3. Return clean data
    # ---------------------------------------------

    return {
        "location": {
            "city": location.get("name"),
            "state": location.get("admin1"),
            "country": location.get("country"),
            "country_code": location.get("country_code"),
            "latitude": weather["latitude"],
            "longitude": weather["longitude"],
            "timezone": weather["timezone"]
        },

        "current": weather["current"],
        "hourly": weather["hourly"]
    }


# ---------------------------------------------
# Get weather by lat/lon (for geolocation)
# Uses Open-Meteo's reverse geocoding to resolve
# a human-readable location name.
# ---------------------------------------------

REVERSE_GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)


def get_weather_by_coords(
    latitude: float,
    longitude: float,
    forecast_days: int = 3
):
    # ---------------------------------------------
    # 1. Reverse-geocode to get a display name
    #    Open-Meteo doesn't support true reverse geo
    #    but we can search by lat/lon bounding box
    #    via the nominatim fallback (free, no key needed)
    # ---------------------------------------------

    location_name = "Your Location"
    location_state = None
    location_country = "Unknown"
    location_country_code = ""

    try:
        nominatim_response = _session.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": latitude,
                "lon": longitude,
                "format": "json",
                "zoom": 10,
                "addressdetails": 1
            },
            headers={
                "User-Agent": "AgriSmart-SmartFarming/1.0",
                "Accept-Language": "en"
            },
            timeout=(8, 20)
        )

        if nominatim_response.ok:
            geo = nominatim_response.json()
            address = geo.get("address", {})
            location_name = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("hamlet")
                or geo.get("display_name", "Your Location").split(",")[0]
            )
            location_state = (
                address.get("state")
                or address.get("county")
            )
            location_country = address.get("country", "Unknown")
            location_country_code = address.get("country_code", "").upper()

    except Exception:
        # Reverse geocoding is best-effort; continue with defaults
        pass

    # ---------------------------------------------
    # 2. Get weather at the provided coordinates
    # ---------------------------------------------

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation_probability,"
            "precipitation,"
            "rain,"
            "wind_speed_10m"
        ),

        "forecast_days": forecast_days,
        "timezone": "auto"
    }

    try:
        weather_response = _session.get(
            WEATHER_URL,
            params=weather_params,
            headers=HEADERS,
            timeout=(10, 30)
        )

        weather_response.raise_for_status()

    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Weather API request timed out."
        )

    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"Weather API request failed: {e}"
        )

    weather = weather_response.json()

    return {
        "location": {
            "city": location_name,
            "state": location_state,
            "country": location_country,
            "country_code": location_country_code,
            "latitude": weather["latitude"],
            "longitude": weather["longitude"],
            "timezone": weather["timezone"]
        },

        "current": weather["current"],
        "hourly": weather["hourly"]
    }