"""Pydantic schemas for fertilizer recommendation."""
from pydantic import BaseModel, Field
from typing import List, Optional


class FertilizerRecommendRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    soil_type: str = Field(..., min_length=1)
    growth_stage: str = Field(..., min_length=1)
    nitrogen: float = Field(..., ge=0, le=300)
    phosphorus: float = Field(..., ge=0, le=150)
    potassium: float = Field(..., ge=0, le=300)
    ph: float = Field(..., ge=0, le=14)
    organic_matter: Optional[float] = Field(None, ge=0, le=100)
    area: float = Field(..., gt=0, le=10000)


class FertilizerScheduleItem(BaseModel):
    stage: str
    timing: str
    amount: str


class FertilizerRecommendResponse(BaseModel):
    recommended: str
    npk_needed: dict
    dosage: str
    schedule: List[FertilizerScheduleItem]
    alternatives: List[str]
    organic_option: str
