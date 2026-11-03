"""Pydantic schemas for weather."""
from pydantic import BaseModel
from typing import List, Optional


class ForecastDay(BaseModel):
    day: str
    high: float
    low: float
    icon: str
    description: str


class CurrentWeatherResponse(BaseModel):
    location: str
    temperature: float
    humidity: float
    wind_speed: float
    description: str
    rainfall: float = 0
    uv_index: float = 0
    visibility: float = 10
    feels_like: float = 0


class ForecastResponse(BaseModel):
    location: str
    forecast: List[ForecastDay]
