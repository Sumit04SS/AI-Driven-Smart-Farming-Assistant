import requests


AGMARKNET_BASE_URL = (
    "https://api.agmarknet.gov.in/v1"
)


def get_market_prices(
    commodity_id: int,
    state_id: int,
    market_id: int,
):
    """
    Get commodity prices for a specific market
    during the last week from AGMARKNET.
    """

    url = (
        f"{AGMARKNET_BASE_URL}"
        "/prices-and-arrivals/"
        "commodity-price/lastweek"
    )

    params = {
        "marketId": market_id,
        "stateId": state_id,
        "commodityId": commodity_id,
        "includeExcel": "false",
    }

    try:

        response = requests.get(
            url,
            params=params,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
            },
            timeout=(10, 60),
        )

        response.raise_for_status()

    except requests.exceptions.Timeout:

        raise RuntimeError(
            "AGMARKNET market price API timed out. "
            "Please try again later."
        )

    except requests.exceptions.RequestException as e:

        raise RuntimeError(
            f"AGMARKNET market price API request failed: {e}"
        )

    try:

        data = response.json()

    except ValueError:

        raise RuntimeError(
            "AGMARKNET returned an invalid response."
        )

    if not data.get("success"):
        raise RuntimeError(
            data.get(
                "message",
                "AGMARKNET could not return market data."
            )
        )

    return format_market_prices(data)


def format_market_prices(data: dict):
    """
    Convert AGMARKNET's date-keyed response into
    a frontend-friendly list of price records.
    """

    formatted_prices = []

    for record in data.get("data", []):

        variety = record.get(
            "variety"
        )

        unit = record.get(
            "unitOfPrice"
        )

        for key, value in record.items():

            # AGMARKNET uses date strings as keys.
            # Ignore metadata fields.
            if key in {
                "variety",
                "unitOfPrice",
            }:
                continue

            if value == "NR":
                continue

            formatted_prices.append(
                {
                    "date": key,
                    "variety": variety,
                    "price": value,
                    "unit": unit,
                }
            )

    return {
        "title": data.get("title"),
        "prices": formatted_prices,
    }

def get_market_filters():
    url = f"{AGMARKNET_BASE_URL}/daily-price-arrival/filters"

    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
            },
            timeout=(10, 60),
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise RuntimeError(
            "AGMARKNET filter API timed out. Please try again later."
        )
    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"AGMARKNET filter API request failed: {e}"
        )

    try:
        data = response.json()
    except ValueError:
        raise RuntimeError(
            "AGMARKNET returned an invalid filter response."
        )

    if not data.get("status"):
        raise RuntimeError(
            data.get("message", "AGMARKNET could not return filter data.")
        )

    return data.get("data", {})


def get_market_states():
    filters = get_market_filters()

    return [
        {
            "id": item.get("id"),
            "name": item.get("state_name"),
        }
        for item in filters.get("state_data", [])
        if item.get("id") is not None
    ]


def get_markets_by_state(state_id: int):
    filters = get_market_filters()

    return [
        {
            "id": item.get("id"),
            "name": item.get("mkt_name", "").strip(),
            "district_id": item.get("district_id"),
        }
        for item in filters.get("market_data", [])
        if item.get("state_id") == state_id
    ]


def get_market_commodities():
    filters = get_market_filters()

    return [
        {
            "id": item.get("cmdt_id"),
            "name": item.get("cmdt_name"),
            "group_id": item.get("cmdt_group_id"),
        }
        for item in filters.get("cmdt_data", [])
        if item.get("cmdt_id") is not None
    ]

def get_market_filters():
    url = f"{AGMARKNET_BASE_URL}/daily-price-arrival/filters"

    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
            },
            timeout=(10, 60),
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise RuntimeError(
            "AGMARKNET filter API timed out. Please try again later."
        )
    except requests.exceptions.RequestException as e:
        raise RuntimeError(
            f"AGMARKNET filter API request failed: {e}"
        )

    try:
        data = response.json()
    except ValueError:
        raise RuntimeError(
            "AGMARKNET returned an invalid filter response."
        )

    if not data.get("status"):
        raise RuntimeError(
            data.get("message", "AGMARKNET could not return filter data.")
        )

    return data.get("data", {})


def get_market_states():
    filters = get_market_filters()

    return [
        {
            "id": item.get("state_id"),
            "name": item.get("state_name"),
        }
        for item in filters.get("state_data", [])
        if item.get("state_id") is not None
        and item.get("state_id") != 100000
    ]


def get_markets_by_state(state_id: int):
    filters = get_market_filters()

    return [
        {
            "id": item.get("id"),
            "name": item.get("mkt_name", "").strip(),
            "district_id": item.get("district_id"),
        }
        for item in filters.get("market_data", [])
        if item.get("state_id") == state_id
    ]


def get_market_commodities():
    filters = get_market_filters()

    return [
        {
            "id": item.get("cmdt_id"),
            "name": item.get("cmdt_name"),
            "group_id": item.get("cmdt_group_id"),
        }
        for item in filters.get("cmdt_data", [])
        if item.get("cmdt_id") is not None
    ]