"""Weather router – OpenWeatherMap integration."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.services.weather_service import get_current_weather, get_forecast, get_full_weather, save_weather_query
from app.core.security import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(
    location: str = Query("Pune", description="City name or 'City, Country' (e.g. 'Delhi, IN')"),
    current_user: dict = Depends(get_current_user),
):
    """Get current weather conditions for a location. Falls back to indicative data if API key not set."""
    data = await get_current_weather(location)
    await save_weather_query(current_user["id"], location, data)
    return data


@router.get("/forecast")
async def forecast(
    location: str = Query("Pune", description="City name"),
    current_user: dict = Depends(get_current_user),
):
    """Get 5-day daily weather forecast. Falls back to indicative data if API key not set."""
    return await get_forecast(location)


@router.get("/full")
async def full_weather(
    location: str = Query("Pune", description="City name"),
    current_user: dict = Depends(get_current_user),
):
    """Get current weather + forecast + AI farming suggestions in one call."""
    data = await get_full_weather(location)
    await save_weather_query(current_user["id"], location, data)
    return data
