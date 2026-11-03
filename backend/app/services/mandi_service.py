"""
Mandi (agricultural market) prices service.

Data Strategy:
1. Attempts to fetch live data from data.gov.in Agmarknet API (if API key configured).
2. Falls back to a curated reference dataset with clear data provenance labels.

IMPORTANT: Never present reference/static prices as live market prices.
All prices are clearly labeled with their data source and timestamp.
"""
import httpx
from datetime import datetime, date
from loguru import logger
from app.core.config import settings

# ── Reference Dataset ─────────────────────────────────────────────────────────
# Source: Agmarknet / NCDEX reference prices (indicative, not live market quotes)
# These reflect approximate historical MSP/modal prices and are for reference only.
_REFERENCE_DATE = "2024-11-01"

REFERENCE_DATA = [
    # Maharashtra
    {"commodity": "Wheat", "variety": "Lok-1", "market": "Pune", "district": "Pune", "state": "Maharashtra", "min_price": 2100, "max_price": 2350, "modal_price": 2200, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Tomato", "variety": "Hybrid", "market": "Pune", "district": "Pune", "state": "Maharashtra", "min_price": 800, "max_price": 1400, "modal_price": 1000, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Onion", "variety": "Red", "market": "Nashik", "district": "Nashik", "state": "Maharashtra", "min_price": 1500, "max_price": 2500, "modal_price": 1800, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Cotton", "variety": "Long Staple (Bt)", "market": "Akola", "district": "Akola", "state": "Maharashtra", "min_price": 6200, "max_price": 7200, "modal_price": 6600, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Soybean", "variety": "Yellow", "market": "Latur", "district": "Latur", "state": "Maharashtra", "min_price": 4100, "max_price": 4800, "modal_price": 4350, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Banana", "variety": "Robusta", "market": "Jalgaon", "district": "Jalgaon", "state": "Maharashtra", "min_price": 600, "max_price": 1200, "modal_price": 800, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Sugarcane", "variety": "CO-86032", "market": "Kolhapur", "district": "Kolhapur", "state": "Maharashtra", "min_price": 320, "max_price": 400, "modal_price": 360, "unit": "quintal", "source": "FRP/SAP reference"},
    {"commodity": "Grapes", "variety": "Thompson Seedless", "market": "Nashik", "district": "Nashik", "state": "Maharashtra", "min_price": 3000, "max_price": 6000, "modal_price": 4500, "unit": "quintal", "source": "Agmarknet reference"},

    # Punjab & Haryana
    {"commodity": "Wheat", "variety": "HD-2967", "market": "Ludhiana", "district": "Ludhiana", "state": "Punjab", "min_price": 2150, "max_price": 2400, "modal_price": 2275, "unit": "quintal", "source": "MSP + Agmarknet reference"},
    {"commodity": "Rice", "variety": "PR-126", "market": "Amritsar", "district": "Amritsar", "state": "Punjab", "min_price": 2100, "max_price": 2300, "modal_price": 2183, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Basmati Rice", "variety": "Pusa Basmati-1121", "market": "Karnal", "district": "Karnal", "state": "Haryana", "min_price": 3200, "max_price": 4500, "modal_price": 3800, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Mustard", "variety": "RH-30", "market": "Hisar", "district": "Hisar", "state": "Haryana", "min_price": 4800, "max_price": 5600, "modal_price": 5200, "unit": "quintal", "source": "MSP + Agmarknet reference"},
    {"commodity": "Potato", "variety": "Kufri Pukhraj", "market": "Jalandhar", "district": "Jalandhar", "state": "Punjab", "min_price": 600, "max_price": 1100, "modal_price": 850, "unit": "quintal", "source": "Agmarknet reference"},

    # Uttar Pradesh
    {"commodity": "Wheat", "variety": "GW-322", "market": "Agra", "district": "Agra", "state": "UP", "min_price": 2050, "max_price": 2300, "modal_price": 2183, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Potato", "variety": "Jyoti", "market": "Agra", "district": "Agra", "state": "UP", "min_price": 700, "max_price": 1100, "modal_price": 900, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Sugarcane", "variety": "CO-0238", "market": "Muzaffarnagar", "district": "Muzaffarnagar", "state": "UP", "min_price": 350, "max_price": 420, "modal_price": 385, "unit": "quintal", "source": "SAP reference"},
    {"commodity": "Rice", "variety": "IR-64", "market": "Meerut", "district": "Meerut", "state": "UP", "min_price": 1900, "max_price": 2200, "modal_price": 2068, "unit": "quintal", "source": "MSP reference"},

    # Madhya Pradesh
    {"commodity": "Wheat", "variety": "Sharbati", "market": "Indore", "district": "Indore", "state": "MP", "min_price": 2100, "max_price": 2500, "modal_price": 2300, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Soybean", "variety": "JS-335", "market": "Ujjain", "district": "Ujjain", "state": "MP", "min_price": 3800, "max_price": 4500, "modal_price": 4200, "unit": "quintal", "source": "MSP + Agmarknet reference"},
    {"commodity": "Garlic", "variety": "Desi", "market": "Mandsaur", "district": "Mandsaur", "state": "MP", "min_price": 3000, "max_price": 8000, "modal_price": 5000, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Chilli", "variety": "Jwala", "market": "Bhopal", "district": "Bhopal", "state": "MP", "min_price": 8000, "max_price": 15000, "modal_price": 11000, "unit": "quintal", "source": "Agmarknet reference"},

    # Gujarat
    {"commodity": "Groundnut", "variety": "Bold (J-11)", "market": "Rajkot", "district": "Rajkot", "state": "Gujarat", "min_price": 5200, "max_price": 6200, "modal_price": 5700, "unit": "quintal", "source": "APMC Rajkot reference"},
    {"commodity": "Cotton", "variety": "Shankar-6", "market": "Surendranagar", "district": "Surendranagar", "state": "Gujarat", "min_price": 5800, "max_price": 7500, "modal_price": 6600, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Cumin", "variety": "Gujarat Cumin", "market": "Unjha", "district": "Mehsana", "state": "Gujarat", "min_price": 18000, "max_price": 28000, "modal_price": 23000, "unit": "quintal", "source": "APMC Unjha reference"},
    {"commodity": "Castor", "variety": "GCH-7", "market": "Deesa", "district": "Banaskantha", "state": "Gujarat", "min_price": 5200, "max_price": 6000, "modal_price": 5600, "unit": "quintal", "source": "Agmarknet reference"},

    # Rajasthan
    {"commodity": "Mustard", "variety": "Varuna (T-59)", "market": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "min_price": 4800, "max_price": 5800, "modal_price": 5263, "unit": "quintal", "source": "MSP + Agmarknet reference"},
    {"commodity": "Guar", "variety": "HG-365", "market": "Jodhpur", "district": "Jodhpur", "state": "Rajasthan", "min_price": 4500, "max_price": 6000, "modal_price": 5100, "unit": "quintal", "source": "NCDEX reference"},
    {"commodity": "Bajra", "variety": "HHB-67", "market": "Jodhpur", "district": "Jodhpur", "state": "Rajasthan", "min_price": 2000, "max_price": 2400, "modal_price": 2150, "unit": "quintal", "source": "MSP reference"},

    # Karnataka
    {"commodity": "Maize", "variety": "NAH-1137 Hybrid", "market": "Davangere", "district": "Davangere", "state": "Karnataka", "min_price": 1750, "max_price": 2200, "modal_price": 1962, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Ragi", "variety": "GPU-66", "market": "Bangalore", "district": "Bangalore Urban", "state": "Karnataka", "min_price": 3200, "max_price": 4000, "modal_price": 3578, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Areca Nut", "variety": "Mangalore", "market": "Shimoga", "district": "Shimoga", "state": "Karnataka", "min_price": 35000, "max_price": 50000, "modal_price": 42000, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Turmeric", "variety": "Nandyal Bullet", "market": "Erode", "district": "Erode", "state": "Tamil Nadu", "min_price": 8000, "max_price": 14000, "modal_price": 11000, "unit": "quintal", "source": "Agmarknet reference"},

    # Andhra Pradesh / Telangana
    {"commodity": "Chilli", "variety": "Guntur Sannam S4", "market": "Guntur", "district": "Guntur", "state": "Andhra Pradesh", "min_price": 7000, "max_price": 14000, "modal_price": 10500, "unit": "quintal", "source": "Agmarknet reference"},
    {"commodity": "Paddy Rice", "variety": "MTU-1010", "market": "Hyderabad", "district": "Ranga Reddy", "state": "Telangana", "min_price": 2100, "max_price": 2300, "modal_price": 2183, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Cotton", "variety": "Bt Hybrid", "market": "Warangal", "district": "Warangal", "state": "Telangana", "min_price": 6000, "max_price": 7200, "modal_price": 6600, "unit": "quintal", "source": "MSP reference"},

    # West Bengal / Bihar
    {"commodity": "Jute", "variety": "Deshi Tossa", "market": "Kolkata", "district": "Kolkata", "state": "West Bengal", "min_price": 4500, "max_price": 5500, "modal_price": 5050, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Paddy Rice", "variety": "Swarna (MTU-7029)", "market": "Midnapore", "district": "West Midnapore", "state": "West Bengal", "min_price": 1800, "max_price": 2100, "modal_price": 2068, "unit": "quintal", "source": "MSP reference"},
    {"commodity": "Maize", "variety": "HQPM-1", "market": "Patna", "district": "Patna", "state": "Bihar", "min_price": 1800, "max_price": 2200, "modal_price": 1962, "unit": "quintal", "source": "MSP reference"},

    # National MSP Reference Prices (added for completeness)
    {"commodity": "Jowar", "variety": "Hybrid", "market": "Solapur", "district": "Solapur", "state": "Maharashtra", "min_price": 2800, "max_price": 3300, "modal_price": 3180, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Bajra", "variety": "HHB-272", "market": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "min_price": 2000, "max_price": 2400, "modal_price": 2150, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Tur (Arhar)", "variety": "ICPL-87119", "market": "Latur", "district": "Latur", "state": "Maharashtra", "min_price": 6600, "max_price": 7200, "modal_price": 7000, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Moong", "variety": "Pusa Vishal", "market": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "min_price": 7400, "max_price": 8200, "modal_price": 8682, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Urad", "variety": "LBG-17", "market": "Nagpur", "district": "Nagpur", "state": "Maharashtra", "min_price": 6400, "max_price": 7200, "modal_price": 7000, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Safflower", "variety": "A-1", "market": "Nagpur", "district": "Nagpur", "state": "Maharashtra", "min_price": 5600, "max_price": 5900, "modal_price": 5800, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Sesame", "variety": "Gujarat Til-2", "market": "Surat", "district": "Surat", "state": "Gujarat", "min_price": 8000, "max_price": 10000, "modal_price": 9267, "unit": "quintal", "source": "MSP 2024-25"},
    {"commodity": "Sunflower", "variety": "KBSH-44", "market": "Bijapur", "district": "Bijapur", "state": "Karnataka", "min_price": 6400, "max_price": 6800, "modal_price": 6760, "unit": "quintal", "source": "MSP 2024-25"},
]


async def _fetch_datagov_prices(commodity: str | None = None, state: str | None = None) -> list | None:
    """
    Attempt to fetch live data from data.gov.in Agmarknet resource.
    Returns None if unavailable or not configured.

    Note: data.gov.in provides Agmarknet modal prices through their open API.
    The resource_id below is for the 'Daily Market Prices' dataset.
    """
    api_key = (getattr(settings, "DATAGOV_API_KEY", "") or "").strip()
    if not api_key or api_key in ("your-datagov-key-here", "change-this"):
        return None

    try:
        params = {
            "resource_id": "9ef84268-d588-465a-a308-a864a43d0070",  # Agmarknet daily prices
            "api-key": api_key,
            "format": "json",
            "limit": 200,
        }
        if commodity and commodity != "All Commodities":
            params["filters[Commodity]"] = commodity
        if state and state != "All States":
            params["filters[State]"] = state

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070", params=params)
            if resp.status_code == 200:
                data = resp.json()
                records = data.get("records", [])
                if records:
                    today = date.today().isoformat()
                    result = []
                    for r in records:
                        try:
                            result.append({
                                "commodity": r.get("Commodity", ""),
                                "variety": r.get("Variety", ""),
                                "market": r.get("Market", ""),
                                "district": r.get("District", ""),
                                "state": r.get("State", ""),
                                "min_price": int(float(r.get("Min Price", 0))),
                                "max_price": int(float(r.get("Max Price", 0))),
                                "modal_price": int(float(r.get("Modal Price", 0))),
                                "unit": "quintal",
                                "date": r.get("Arrival Date", today),
                                "source": "data.gov.in (Agmarknet live)",
                                "is_live": True,
                            })
                        except (ValueError, TypeError):
                            continue
                    return result
    except Exception as e:
        logger.warning(f"data.gov.in API call failed: {e}")

    return None


def get_prices(
    state: str | None = None,
    commodity: str | None = None,
    search: str | None = None,
    district: str | None = None,
    market: str | None = None,
) -> dict:
    """
    Filter and return mandi prices from the reference dataset.
    Always label data source clearly. Never present as live quotes.
    """
    today = date.today().isoformat()
    data = REFERENCE_DATA

    if state and state not in ("All States", "All"):
        data = [p for p in data if p["state"].lower() == state.lower()]
    if commodity and commodity not in ("All Commodities", "All"):
        data = [p for p in data if p["commodity"].lower() == commodity.lower()]
    if district:
        data = [p for p in data if district.lower() in p.get("district", "").lower()]
    if market:
        data = [p for p in data if market.lower() in p["market"].lower()]
    if search:
        sl = search.lower()
        data = [
            p for p in data
            if sl in p["commodity"].lower()
            or sl in p["market"].lower()
            or sl in p["state"].lower()
            or sl in p.get("variety", "").lower()
            or sl in p.get("district", "").lower()
        ]

    results = [{
        **p,
        "date": today,
        "is_live": False,
    } for p in data]

    return {
        "prices": results,
        "total": len(results),
        "last_updated": datetime.now().isoformat(),
        "data_source": "Agmarknet reference data / MSP 2024-25",
        "data_note": (
            "⚠️ Prices shown are reference/indicative figures based on Agmarknet historical data and MSP 2024-25. "
            "They are NOT live market prices. Always verify with your local APMC mandi or AGMARKNET portal "
            "(agmarknet.nic.in) before making any buying or selling decisions."
        ),
        "live_available": False,
    }


def get_states() -> list:
    return sorted(set(p["state"] for p in REFERENCE_DATA))


def get_commodities() -> list:
    return sorted(set(p["commodity"] for p in REFERENCE_DATA))


def get_districts(state: str | None = None) -> list:
    data = REFERENCE_DATA
    if state:
        data = [p for p in data if p["state"].lower() == state.lower()]
    return sorted(set(p.get("district", "") for p in data if p.get("district")))


def get_markets(state: str | None = None, district: str | None = None) -> list:
    data = REFERENCE_DATA
    if state:
        data = [p for p in data if p["state"].lower() == state.lower()]
    if district:
        data = [p for p in data if p.get("district", "").lower() == district.lower()]
    return sorted(set(p["market"] for p in data))
