"""Pydantic schemas for disease detection."""
from pydantic import BaseModel
from typing import List, Optional


class DiseaseDetectResponse(BaseModel):
    disease: str
    confidence: float
    plant: str
    severity: str
    description: str
    treatment: List[str]
    prevention: List[str]


class DiseaseHistoryItem(BaseModel):
    id: str
    disease: str
    plant: str
    confidence: float
    severity: str
    created_at: str
    image_filename: Optional[str] = None
