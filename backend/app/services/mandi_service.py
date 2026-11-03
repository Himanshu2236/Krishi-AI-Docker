"""
Mandi (market) prices service.
Uses built-in data – can be connected to Agmarknet API in future.
"""
from datetime import datetime

MANDI_DATA = [
    {"commodity": "Wheat", "variety": "Sharbati", "market": "Indore", "state": "MP", "min_price": 2100, "max_price": 2350, "modal_price": 2200, "unit": "quintal"},
    {"commodity": "Rice", "variety": "Basmati", "market": "Karnal", "state": "Haryana", "min_price": 3200, "max_price": 3800, "modal_price": 3500, "unit": "quintal"},
    {"commodity": "Tomato", "variety": "Hybrid", "market": "Pune", "state": "Maharashtra", "min_price": 800, "max_price": 1200, "modal_price": 1000, "unit": "quintal"},
    {"commodity": "Onion", "variety": "Red", "market": "Nashik", "state": "Maharashtra", "min_price": 1500, "max_price": 2200, "modal_price": 1800, "unit": "quintal"},
    {"commodity": "Cotton", "variety": "Long Staple", "market": "Akola", "state": "Maharashtra", "min_price": 6200, "max_price": 7000, "modal_price": 6600, "unit": "quintal"},
    {"commodity": "Soybean", "variety": "Yellow", "market": "Latur", "state": "Maharashtra", "min_price": 4100, "max_price": 4600, "modal_price": 4350, "unit": "quintal"},
    {"commodity": "Maize", "variety": "Hybrid", "market": "Davangere", "state": "Karnataka", "min_price": 1750, "max_price": 2100, "modal_price": 1900, "unit": "quintal"},
    {"commodity": "Potato", "variety": "Jyoti", "market": "Agra", "state": "UP", "min_price": 700, "max_price": 1100, "modal_price": 900, "unit": "quintal"},
    {"commodity": "Sugarcane", "variety": "CO-0238", "market": "Muzaffarnagar", "state": "UP", "min_price": 350, "max_price": 400, "modal_price": 385, "unit": "quintal"},
    {"commodity": "Groundnut", "variety": "Bold", "market": "Rajkot", "state": "Gujarat", "min_price": 5200, "max_price": 5800, "modal_price": 5500, "unit": "quintal"},
    {"commodity": "Mustard", "variety": "Black", "market": "Jaipur", "state": "Rajasthan", "min_price": 4800, "max_price": 5400, "modal_price": 5100, "unit": "quintal"},
    {"commodity": "Turmeric", "variety": "Erode", "market": "Erode", "state": "Tamil Nadu", "min_price": 8000, "max_price": 12000, "modal_price": 10000, "unit": "quintal"},
    {"commodity": "Banana", "variety": "Robusta", "market": "Jalgaon", "state": "Maharashtra", "min_price": 600, "max_price": 1000, "modal_price": 800, "unit": "quintal"},
    {"commodity": "Chilli", "variety": "Guntur", "market": "Guntur", "state": "Andhra Pradesh", "min_price": 7000, "max_price": 12000, "modal_price": 9500, "unit": "quintal"},
]


def get_prices(state: str | None = None, commodity: str | None = None, search: str | None = None) -> dict:
    """Filter and return mandi prices."""
    today = datetime.now().strftime("%Y-%m-%d")
    filtered = MANDI_DATA

    if state and state != "All States":
        filtered = [p for p in filtered if p["state"].lower() == state.lower()]
    if commodity and commodity != "All Commodities":
        filtered = [p for p in filtered if p["commodity"].lower() == commodity.lower()]
    if search:
        search_lower = search.lower()
        filtered = [
            p for p in filtered
            if search_lower in p["commodity"].lower()
            or search_lower in p["market"].lower()
            or search_lower in p["state"].lower()
        ]

    # Add date
    results = [{**p, "date": today} for p in filtered]

    return {
        "prices": results,
        "total": len(results),
        "last_updated": datetime.now().isoformat(),
    }


def get_states() -> list:
    return sorted(set(p["state"] for p in MANDI_DATA))


def get_commodities() -> list:
    return sorted(set(p["commodity"] for p in MANDI_DATA))
