"""Pydantic schemas for crop recommendation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


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


class GrowingConditions(BaseModel):
    temperature: str
    humidity: str
    soil_ph: str
    soil_type: str


class WaterRequirements(BaseModel):
    annual_rainfall_mm: str
    irrigation_schedule: str
    water_sensitivity: str


class CropInformation(BaseModel):
    scientific_name: str
    season: str
    growing_period: str
    expected_yield: str
    economic_importance: str


class CropRecommendResponse(BaseModel):
    recommended_crop: str
    confidence: float
    model_used: str = "Random Forest Classifier (Scikit-Learn, 99.55% accuracy)"
    alternatives: List[AlternativeCrop]
    reasoning: str
    tips: List[str]
    crop_information: Optional[CropInformation] = None
    suitable_growing_conditions: Optional[GrowingConditions] = None
    estimated_water_requirements: Optional[WaterRequirements] = None
    crop_info: Optional[Dict[str, Any]] = None
    growing_conditions: Optional[Dict[str, Any]] = None
    water_requirements: Optional[Dict[str, Any]] = None


class CropHistoryItem(BaseModel):
    id: str
    input_data: dict
    recommended_crop: str
    confidence: float
    created_at: str
