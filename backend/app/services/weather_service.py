"""
Weather service – OpenWeatherMap API integration with farming advisory.
Falls back to indicative data when API key is not configured.
"""
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.database.connection import get_collection
from loguru import logger

OWM_BASE = "https://api.openweathermap.org/data/2.5"

# Day-of-week abbreviations in English
DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

WEATHER_ICONS = {
    "Clear": "☀️",
    "Clouds": "⛅",
    "Rain": "🌧️",
    "Drizzle": "🌦️",
    "Thunderstorm": "⛈️",
    "Snow": "❄️",
    "Mist": "🌫️",
    "Haze": "🌫️",
    "Fog": "🌫️",
    "Smoke": "🌫️",
    "Dust": "🌬️",
    "Sand": "🌬️",
    "Ash": "🌋",
    "Squall": "🌊",
    "Tornado": "🌪️",
}

# Indicative weather (shown when OpenWeather API key not configured)
FALLBACK_WEATHER = {
    "location": "Pune, Maharashtra",
    "temperature": 28,
    "humidity": 65,
    "wind_speed": 12,
    "description": "Partly Cloudy",
    "main": "Clouds",
    "rainfall": 0,
    "uv_index": 6,
    "visibility": 10,
    "feels_like": 31,
    "pressure": 1013,
    "data_source": "indicative",
    "data_note": "Configure OPENWEATHER_API_KEY in backend/.env for live weather data.",
}

FALLBACK_FORECAST = [
    {"day": "Mon", "high": 30, "low": 22, "icon": "☀️", "description": "Sunny", "main": "Clear", "humidity": 60},
    {"day": "Tue", "high": 28, "low": 21, "icon": "⛅", "description": "Partly Cloudy", "main": "Clouds", "humidity": 65},
    {"day": "Wed", "high": 25, "low": 19, "icon": "🌧️", "description": "Rain", "main": "Rain", "humidity": 80},
    {"day": "Thu", "high": 27, "low": 20, "icon": "⛅", "description": "Partly Cloudy", "main": "Clouds", "humidity": 70},
    {"day": "Fri", "high": 29, "low": 22, "icon": "☀️", "description": "Sunny", "main": "Clear", "humidity": 58},
    {"day": "Sat", "high": 31, "low": 23, "icon": "☀️", "description": "Sunny", "main": "Clear", "humidity": 55},
    {"day": "Sun", "high": 27, "low": 21, "icon": "🌦️", "description": "Light Showers", "main": "Rain", "humidity": 75},
]


def _get_api_key() -> str | None:
    key = (settings.OPENWEATHER_API_KEY or "").strip()
    if key and key not in ("your-openweathermap-key-here", "your_openweather_key", "change-this"):
        return key
    return None


def _farming_suggestions(weather: dict, forecast: list) -> list[str]:
    """Generate context-aware farming advisory based on current weather data."""
    suggestions = []
    temp = weather.get("temperature", 25)
    humidity = weather.get("humidity", 60)
    wind = weather.get("wind_speed", 10)
    rainfall = weather.get("rainfall", 0)
    main = weather.get("main", "Clear")

    # Rain-related advisories
    rain_days = sum(1 for f in forecast if f.get("main") in ("Rain", "Drizzle", "Thunderstorm"))
    if rain_days >= 3:
        suggestions.append("🌧️ Heavy rainfall expected this week. Hold off on irrigation and delay fertilizer application to avoid nutrient washout.")
        suggestions.append("🌾 Complete harvesting of mature crops before heavy rain arrives to prevent post-harvest losses.")
    elif rain_days >= 1:
        suggestions.append("🌦️ Light rain expected. Consider reducing irrigation frequency — the natural moisture will benefit most crops.")

    if rainfall > 10:
        suggestions.append("⚠️ Significant rainfall today. Ensure proper drainage in fields to avoid waterlogging, especially for pulse crops.")
    elif rainfall == 0 and main == "Clear":
        suggestions.append("💧 No rainfall today. Check soil moisture and irrigate susceptible crops in the evening to reduce evaporation loss.")

    # Temperature advisories
    if temp > 38:
        suggestions.append("🌡️ Extreme heat today. Irrigate in early morning or late evening. Mulch around vegetable crops to conserve soil moisture.")
    elif temp > 33:
        suggestions.append("☀️ High temperature expected. Protect young seedlings from direct afternoon sun. Avoid pesticide spraying during peak heat.")
    elif temp < 12:
        suggestions.append("🥶 Cold weather ahead. Cover frost-sensitive crops (tomato, chilli, brinjal) with polythene mulch or protective cloth.")
    elif 20 <= temp <= 28:
        suggestions.append("✅ Optimal temperature range for most crops. Excellent time for transplanting seedlings and applying growth-stage fertilizers.")

    # Humidity advisories
    if humidity > 80:
        suggestions.append("🍄 High humidity detected. Risk of fungal diseases (blast, blight, mildew) is elevated. Consider preventive copper-based fungicide spray.")
    elif humidity < 35:
        suggestions.append("🏜️ Low humidity with dry air. Increase irrigation frequency for vegetable crops. Mulching will help retain soil moisture.")

    # Wind advisories
    if wind > 35:
        suggestions.append("💨 Strong winds forecast. Stake tall crops (sugarcane, maize, sorghum) and avoid spraying pesticides — spray drift will reduce efficacy.")
    elif wind > 20:
        suggestions.append("🌬️ Moderate winds. Avoid foliar spraying today. Secure greenhouse covers and shade nets.")

    # General good-weather tip
    if main == "Clear" and 20 <= temp <= 30 and humidity < 70:
        suggestions.append("🚜 Ideal field conditions today. Good time for mechanized operations like tillage, sowing, and inter-culture.")

    if not suggestions:
        suggestions.append("🌱 Monitor your crops regularly and maintain optimal soil moisture based on your crop's phenological stage.")

    return suggestions[:5]  # Return top 5 relevant advisories


async def get_current_weather(location: str = "Pune") -> dict:
    """Fetch current weather from OpenWeatherMap. Falls back to indicative data if key not set."""
    api_key = _get_api_key()

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{OWM_BASE}/weather",
                    params={"q": location, "appid": api_key, "units": "metric"},
                )
                if resp.status_code == 200:
                    d = resp.json()
                    main_condition = d["weather"][0]["main"]
                    data = {
                        "location": f"{d['name']}, {d.get('sys', {}).get('country', 'IN')}",
                        "temperature": round(d["main"]["temp"]),
                        "humidity": d["main"]["humidity"],
                        "wind_speed": round(d["wind"]["speed"] * 3.6, 1),  # m/s → km/h
                        "description": d["weather"][0]["description"].title(),
                        "main": main_condition,
                        "rainfall": round(d.get("rain", {}).get("1h", 0), 2),
                        "uv_index": 0,  # requires separate OWM UV endpoint
                        "visibility": round(d.get("visibility", 10000) / 1000),
                        "feels_like": round(d["main"]["feels_like"]),
                        "pressure": d["main"].get("pressure", 1013),
                        "data_source": "openweathermap",
                        "data_note": "Live data from OpenWeatherMap API.",
                    }
                    return data
                elif resp.status_code == 404:
                    logger.warning(f"Location '{location}' not found in OpenWeatherMap")
                    return {**FALLBACK_WEATHER, "location": location, "error": f"Location '{location}' not found. Showing indicative data."}
                else:
                    logger.warning(f"OpenWeatherMap returned {resp.status_code}: {resp.text[:200]}")
        except httpx.TimeoutException:
            logger.warning(f"OpenWeatherMap timeout for location: {location}")
        except Exception as e:
            logger.warning(f"Weather API error: {e}")

    # Fallback
    result = FALLBACK_WEATHER.copy()
    if location and location.lower() not in ("pune", "pune, maharashtra"):
        result["location"] = location
    return result


async def get_forecast(location: str = "Pune") -> dict:
    """Fetch 5-day/3-hour forecast from OpenWeatherMap, collapsed to daily. Falls back to indicative."""
    api_key = _get_api_key()

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{OWM_BASE}/forecast",
                    params={"q": location, "appid": api_key, "units": "metric", "cnt": 40},
                )
                if resp.status_code == 200:
                    d = resp.json()
                    city = d.get("city", {}).get("name", location)
                    country = d.get("city", {}).get("country", "IN")

                    # Collapse 3-hour slots into daily summaries
                    daily: dict[str, dict] = {}
                    for item in d["list"]:
                        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
                        day_key = dt.strftime("%Y-%m-%d")
                        if day_key not in daily:
                            daily[day_key] = {
                                "day": DAY_NAMES[dt.weekday()],
                                "high": item["main"]["temp_max"],
                                "low": item["main"]["temp_min"],
                                "main": item["weather"][0]["main"],
                                "description": item["weather"][0]["description"].title(),
                                "humidity": item["main"]["humidity"],
                                "slots": 1,
                            }
                        else:
                            daily[day_key]["high"] = max(daily[day_key]["high"], item["main"]["temp_max"])
                            daily[day_key]["low"] = min(daily[day_key]["low"], item["main"]["temp_min"])
                            daily[day_key]["humidity"] += item["main"]["humidity"]
                            daily[day_key]["slots"] += 1
                            # Prefer rain/storm main condition
                            if item["weather"][0]["main"] in ("Thunderstorm", "Rain", "Snow"):
                                daily[day_key]["main"] = item["weather"][0]["main"]
                                daily[day_key]["description"] = item["weather"][0]["description"].title()

                    forecast = []
                    for day_data in list(daily.values())[:7]:
                        avg_humidity = round(day_data["humidity"] / day_data["slots"])
                        forecast.append({
                            "day": day_data["day"],
                            "high": round(day_data["high"]),
                            "low": round(day_data["low"]),
                            "icon": WEATHER_ICONS.get(day_data["main"], "🌤️"),
                            "description": day_data["description"],
                            "main": day_data["main"],
                            "humidity": avg_humidity,
                        })

                    return {
                        "location": f"{city}, {country}",
                        "forecast": forecast,
                        "data_source": "openweathermap",
                    }
                elif resp.status_code == 404:
                    logger.warning(f"Forecast: Location '{location}' not found")
        except Exception as e:
            logger.warning(f"Forecast API error: {e}")

    return {
        "location": location or "Pune, Maharashtra",
        "forecast": FALLBACK_FORECAST,
        "data_source": "indicative",
        "data_note": "Indicative forecast. Add OPENWEATHER_API_KEY for live 5-day forecast.",
    }


async def get_full_weather(location: str = "Pune") -> dict:
    """Combined endpoint: current + forecast + farming suggestions."""
    current = await get_current_weather(location)
    forecast_data = await get_forecast(location)
    forecast = forecast_data.get("forecast", FALLBACK_FORECAST)
    suggestions = _farming_suggestions(current, forecast)

    return {
        **current,
        "forecast": forecast,
        "farming_suggestions": suggestions,
    }


async def save_weather_query(user_id: str, location: str, data: dict) -> None:
    col = await get_collection("weather_history")
    await col.insert_one({
        "user_id": user_id,
        "location": location,
        "temperature": data.get("temperature"),
        "description": data.get("description"),
        "data_source": data.get("data_source", "unknown"),
        "created_at": datetime.now(timezone.utc),
    })
