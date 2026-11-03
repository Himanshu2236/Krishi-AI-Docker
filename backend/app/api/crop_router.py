"""Crop recommendation router."""
from fastapi import APIRouter, Depends
from app.schemas.crop import CropRecommendRequest, CropRecommendResponse
from app.services.crop_service import recommend_crop, save_recommendation, get_user_history
from app.core.security import get_current_user

router = APIRouter(prefix="/crops", tags=["Crop Recommendation"])


@router.post("/recommend", response_model=CropRecommendResponse)
async def recommend(
    data: CropRecommendRequest,
    current_user: dict = Depends(get_current_user),
):
    """Get AI-powered crop recommendation based on soil and climate parameters."""
    result = recommend_crop(data)
    await save_recommendation(
        user_id=current_user["id"],
        input_data=data.model_dump(),
        result=result,
    )
    return result


@router.get("/history")
async def history(current_user: dict = Depends(get_current_user)):
    """Get user's crop recommendation history."""
    items = await get_user_history(current_user["id"])
    return {"history": items}
