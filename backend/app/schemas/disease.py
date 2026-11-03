"""Pydantic schemas for disease detection."""
from pydantic import BaseModel, Field
from typing import List, Optional


class DiseaseDetectResponse(BaseModel):
    crop: str = Field(..., description="Detected crop species (e.g., Tomato, Potato, Pepper, Corn, Rice)")
    disease: str = Field(..., description="Identified disease name or Healthy status")
    confidence: float = Field(..., description="Prediction confidence score between 0.0 and 1.0")
    symptoms: str = Field(..., description="Observed morphological and physiological symptoms")
    possible_causes: str = Field(..., description="Pathogen type, fungal/bacterial vectors, or environmental causes")
    prevention_methods: List[str] = Field(default_factory=list, description="Preventive measures and biosecurity steps")
    suggested_management_practices: List[str] = Field(default_factory=list, description="Curative agronomic, cultural and chemical management actions")
    
    # Backward compatibility fields for UI
    plant: str = ""
    severity: str = "Moderate"
    description: str = ""
    treatment: List[str] = Field(default_factory=list)
    prevention: List[str] = Field(default_factory=list)


class DiseaseHistoryItem(BaseModel):
    id: str
    crop: str
    disease: str
    plant: str
    confidence: float
    severity: str
    created_at: str
    image_filename: Optional[str] = None
