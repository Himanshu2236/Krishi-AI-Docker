# app/models __init__
"""
Database models / Document representations for Krishi AI.
MongoDB collections:
1. Users
2. FarmerProfiles
3. CropRecommendations
4. DiseaseDetectionHistory
5. FertilizerRecommendations
6. ChatHistory
7. WeatherHistory
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class UserDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: str
    phone: str
    password_hash: str
    location: str = ""
    farm_size: str = ""
    primary_crops: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FarmerProfileDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    state: str
    farm_size: str = ""
    primary_crops: List[str] = []
    soil_type: str = ""
    irrigation_type: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CropRecommendationDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    input_data: Dict[str, Any]
    recommended_crop: str
    confidence: float
    alternatives: List[Dict[str, Any]]
    reasoning: str
    tips: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DiseaseDetectionDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    disease: str
    confidence: float
    plant: str
    severity: str
    description: str
    treatment: List[str]
    prevention: List[str]
    image_filename: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FertilizerRecommendationDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    input_data: Dict[str, Any]
    recommended: str
    npk_needed: Dict[str, Any]
    dosage: str
    schedule: List[Dict[str, Any]] = []
    alternatives: List[str] = []
    organic_option: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    session_id: str
    role: str # user or assistant
    content: str
    language: str = "en"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WeatherHistoryDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    location: str
    data: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
