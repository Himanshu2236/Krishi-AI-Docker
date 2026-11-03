"""Fertilizer recommendation router."""
from fastapi import APIRouter, Depends
from app.schemas.fertilizer import FertilizerRecommendRequest, FertilizerRecommendResponse
from app.services.fertilizer_service import recommend_fertilizer, save_recommendation
from app.core.security import get_current_user

router = APIRouter(prefix="/fertilizer", tags=["Fertilizer Recommendation"])


@router.post("/recommend", response_model=FertilizerRecommendResponse)
async def recommend(
    data: FertilizerRecommendRequest,
    current_user: dict = Depends(get_current_user),
):
    """Get fertilizer recommendation based on soil and crop data."""
    result = recommend_fertilizer(data)
    await save_recommendation(
        user_id=current_user["id"],
        input_data=data.model_dump(),
        result=result,
    )
    return result
