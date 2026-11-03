"""Pydantic schemas for fertilizer recommendation."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class FertilizerRecommendRequest(BaseModel):
    crop: str = Field(..., min_length=1, description="Target crop (e.g., Rice, Wheat, Cotton, Tomato, Potato, Maize, Sugarcane)")
    soil_type: str = Field(..., min_length=1, description="Soil texture type (e.g., Clay, Loamy, Sandy, Alluvial, Black Soil, Red Soil)")
    nitrogen: float = Field(..., ge=0, le=500, description="Soil available Nitrogen (N) in kg/ha or ppm")
    phosphorus: float = Field(..., ge=0, le=300, description="Soil available Phosphorus (P) in kg/ha or ppm")
    potassium: float = Field(..., ge=0, le=600, description="Soil available Potassium (K) in kg/ha or ppm")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level (e.g. 6.5)")
    growth_stage: Optional[str] = Field("Basal / Sowing", description="Current crop growth stage")
    organic_matter: Optional[float] = Field(None, ge=0, le=100, description="Soil organic carbon percentage")
    area: Optional[float] = Field(1.0, gt=0, le=10000, description="Farm area in hectares (default 1.0 ha)")


class NutrientDeficiencyAnalysis(BaseModel):
    nitrogen_status: str
    phosphorus_status: str
    potassium_status: str
    deficits: Dict[str, float]
    summary: str


class FertilizerOption(BaseModel):
    name: str
    category: str  # Chemical, Organic, Bio-fertilizer
    dosage: str
    purpose: str


class FertilizerScheduleItem(BaseModel):
    stage: str
    timing: str
    amount: str
    instructions: Optional[str] = ""


class FertilizerRecommendResponse(BaseModel):
    crop: str
    soil_type: str
    nutrient_deficiency: NutrientDeficiencyAnalysis
    fertilizer_options: List[FertilizerOption]
    application_guidance: List[str]
    soil_improvement_suggestions: List[str]
    
    # Backward compatible fields for UI compatibility
    recommended: str
    npk_needed: Dict[str, float]
    dosage: str
    schedule: List[FertilizerScheduleItem]
    alternatives: List[str]
    organic_option: str
