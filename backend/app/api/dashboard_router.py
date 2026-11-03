"""Dashboard stats router."""
from fastapi import APIRouter, Depends
from app.services.dashboard_service import get_dashboard_stats
from app.core.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def stats(current_user: dict = Depends(get_current_user)):
    """Get aggregated dashboard statistics for the current user."""
    return await get_dashboard_stats(current_user["id"])
