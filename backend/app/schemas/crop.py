"""Pydantic schemas for crop recommendation."""
from pydantic import BaseModel, Field
from typing import Optional, List


class CropRecommendRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=300, description="Nitrogen (mg/kg)")
    phosphorus: float = Field(..., ge=0, le=150, description="Phosphorus (mg/kg)")
    potassium: float = Field(..., ge=0, le=300, description="Potassium (mg/kg)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall (mm)")


class AlternativeCrop(BaseModel):
    crop: str
    confidence: float


class CropRecommendResponse(BaseModel):
    recommended_crop: str
    confidence: float
    alternatives: List[AlternativeCrop]
    reasoning: str
    tips: List[str]


class CropHistoryItem(BaseModel):
    id: str
    input_data: dict
    recommended_crop: str
    confidence: float
    created_at: str
