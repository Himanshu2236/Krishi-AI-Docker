"""Pydantic schemas for dashboard."""
from pydantic import BaseModel
from typing import List


class RecentActivity(BaseModel):
    id: int
    type: str
    action: str
    detail: str
    time: str
    icon: str


class YieldDataPoint(BaseModel):
    month: str
    yield_value: float


class PriceComparison(BaseModel):
    crop: str
    current: float
    last_month: float
    last_year: float


class DashboardStatsResponse(BaseModel):
    total_recommendations: int
    diseases_detected: int
    weather_alerts: int
    schemes_eligible: int
    recent_activities: List[RecentActivity]
    crop_yield_data: List[YieldDataPoint]
    price_comparison_data: List[PriceComparison]
