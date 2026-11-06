from backend.services.market_service import get_market_prices


result = get_market_prices(
    commodity_id=1,
    state_id=20,
    market_id=570,
)


print("\n==============================")
print("AGMARKNET MARKET TEST")
print("==============================")

print("\nResponse:")

print(result)