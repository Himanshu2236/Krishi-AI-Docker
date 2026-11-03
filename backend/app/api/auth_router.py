"""Authentication router."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.schemas.auth import (
    RegisterRequest, LoginRequest, UpdateProfileRequest,
    UserResponse, TokenResponse,
)
from app.core.security import (
    hash_password, verify_password, create_access_token, get_current_user,
)
from app.database.connection import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_to_response(user: dict, token: str | None = None) -> dict:
    """Convert MongoDB user doc to API response."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "location": user.get("location", ""),
        "farm_size": user.get("farm_size", ""),
        "primary_crops": user.get("primary_crops", []),
        "join_date": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d"),
        "token": token,
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Create a new user account."""
    users = await get_collection("users")

    # Check existing email
    existing = await users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user document
    user_doc = {
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "location": data.state,
        "farm_size": "",
        "primary_crops": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Create farmer profile
    profiles = await get_collection("farmer_profiles")
    await profiles.insert_one({
        "user_id": str(result.inserted_id),
        "state": data.state,
        "farm_size": "",
        "primary_crops": [],
        "soil_type": "",
        "irrigation_type": "",
        "created_at": datetime.now(timezone.utc),
    })

    # Generate JWT
    token = create_access_token({"sub": str(result.inserted_id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_to_response(user_doc, token),
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Log in and receive a JWT token."""
    users = await get_collection("users")
    user = await users.find_one({"email": data.email.lower()})

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user["_id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_to_response(user, token),
    }


@router.post("/logout")
async def logout():
    """Logout endpoint."""
    return {"message": "Logged out successfully"}


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return the current user's profile."""
    return _user_to_response(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's profile."""
    users = await get_collection("users")
    updates = {}
    if data.name is not None:
        updates["name"] = data.name
    if data.phone is not None:
        updates["phone"] = data.phone
    if data.location is not None:
        updates["location"] = data.location
    if data.farm_size is not None:
        updates["farm_size"] = data.farm_size
    if data.primary_crops is not None:
        updates["primary_crops"] = data.primary_crops

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": updates},
        )

    # Fetch updated user
    user = await users.find_one({"_id": ObjectId(current_user["id"])})
    return _user_to_response(user)
