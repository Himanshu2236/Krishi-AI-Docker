"""Weather router."""
from fastapi import APIRouter, Depends, Query
from app.services.weather_service import get_current_weather, get_forecast, save_weather_query
from app.core.security import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(
    location: str = Query("Pune", description="City name"),
    current_user: dict = Depends(get_current_user),
):
    """Get current weather for a location."""
    data = await get_current_weather(location)
    await save_weather_query(current_user["id"], location, data)
    return data


@router.get("/forecast")
async def forecast(
    location: str = Query("Pune", description="City name"),
    current_user: dict = Depends(get_current_user),
):
    """Get 7-day weather forecast."""
    return await get_forecast(location)
