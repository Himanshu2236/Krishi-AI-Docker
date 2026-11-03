"""Pydantic schemas for authentication."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


# ─── Request schemas ────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Ramesh Kumar"])
    email: EmailStr = Field(..., examples=["ramesh@example.com"])
    phone: str = Field(..., pattern=r"^[6-9]\d{9}$", examples=["9876543210"])
    password: str = Field(..., min_length=6, max_length=128)
    state: str = Field(..., min_length=2, max_length=50, examples=["Maharashtra"])


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["ramesh@example.com"])
    password: str = Field(..., min_length=1)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$")
    location: Optional[str] = None
    farm_size: Optional[str] = None
    primary_crops: Optional[List[str]] = None


# ─── Response schemas ───────────────────────────────────────────────────────
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    location: str = ""
    farm_size: str = ""
    primary_crops: List[str] = []
    join_date: str = ""
    token: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
