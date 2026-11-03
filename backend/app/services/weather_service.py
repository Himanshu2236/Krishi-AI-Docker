"""
Weather service – uses OpenWeatherMap API.
Falls back to mock data when API key is not configured.
"""
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.database.connection import get_collection
from loguru import logger

MOCK_WEATHER = {
    "location": "Pune, Maharashtra",
    "temperature": 28,
    "humidity": 65,
    "wind_speed": 12,
    "description": "Partly Cloudy",
    "rainfall": 2.3,
    "uv_index": 6,
    "visibility": 10,
    "feels_like": 31,
}

MOCK_FORECAST = [
    {"day": "Mon", "high": 30, "low": 22, "icon": "☀️", "description": "Sunny"},
    {"day": "Tue", "high": 28, "low": 21, "icon": "⛅", "description": "Partly Cloudy"},
    {"day": "Wed", "high": 25, "low": 19, "icon": "🌧️", "description": "Rain"},
    {"day": "Thu", "high": 27, "low": 20, "icon": "⛅", "description": "Partly Cloudy"},
    {"day": "Fri", "high": 29, "low": 22, "icon": "☀️", "description": "Sunny"},
    {"day": "Sat", "high": 31, "low": 23, "icon": "☀️", "description": "Sunny"},
    {"day": "Sun", "high": 27, "low": 21, "icon": "🌦️", "description": "Showers"},
]

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
}


async def get_current_weather(location: str = "Pune") -> dict:
    """Fetch current weather from OpenWeatherMap, fallback to mock."""
    api_key = settings.OPENWEATHER_API_KEY
    if api_key and api_key != "your-openweathermap-key-here":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={"q": location, "appid": api_key, "units": "metric"},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "location": f"{data['name']}, {data.get('sys', {}).get('country', '')}",
                        "temperature": round(data["main"]["temp"]),
                        "humidity": data["main"]["humidity"],
                        "wind_speed": round(data["wind"]["speed"] * 3.6),  # m/s to km/h
                        "description": data["weather"][0]["description"].title(),
                        "rainfall": data.get("rain", {}).get("1h", 0),
                        "uv_index": 0,
                        "visibility": round(data.get("visibility", 10000) / 1000),
                        "feels_like": round(data["main"]["feels_like"]),
                    }
                else:
                    logger.warning(f"OpenWeather API returned {resp.status_code}")
        except Exception as e:
            logger.warning(f"Weather API failed: {e}")

    # Fallback
    result = MOCK_WEATHER.copy()
    if location:
        result["location"] = location
    return result


async def get_forecast(location: str = "Pune") -> dict:
    """Fetch 7-day forecast from OpenWeatherMap, fallback to mock."""
    api_key = settings.OPENWEATHER_API_KEY
    if api_key and api_key != "your-openweathermap-key-here":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://api.openweathermap.org/data/2.5/forecast",
                    params={"q": location, "appid": api_key, "units": "metric", "cnt": 40},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    # Group by day
                    daily = {}
                    for item in data["list"]:
                        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
                        day_key = dt.strftime("%Y-%m-%d")
                        if day_key not in daily:
                            daily[day_key] = {
                                "day": DAY_NAMES[dt.weekday()],
                                "high": item["main"]["temp_max"],
                                "low": item["main"]["temp_min"],
                                "main": item["weather"][0]["main"],
                                "description": item["weather"][0]["description"].title(),
                            }
                        else:
                            daily[day_key]["high"] = max(daily[day_key]["high"], item["main"]["temp_max"])
                            daily[day_key]["low"] = min(daily[day_key]["low"], item["main"]["temp_min"])

                    forecast = []
                    for day_data in list(daily.values())[:7]:
                        forecast.append({
                            "day": day_data["day"],
                            "high": round(day_data["high"]),
                            "low": round(day_data["low"]),
                            "icon": WEATHER_ICONS.get(day_data["main"], "🌤️"),
                            "description": day_data["description"],
                        })
                    return {"location": location, "forecast": forecast}
        except Exception as e:
            logger.warning(f"Forecast API failed: {e}")

    return {"location": location or "Pune, Maharashtra", "forecast": MOCK_FORECAST}


async def save_weather_query(user_id: str, location: str, data: dict) -> None:
    col = await get_collection("weather_history")
    await col.insert_one({
        "user_id": user_id,
        "location": location,
        "data": data,
        "created_at": datetime.now(timezone.utc),
    })
