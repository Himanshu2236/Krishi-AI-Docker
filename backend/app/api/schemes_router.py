"""Government schemes router."""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.services.schemes_service import get_all_schemes, get_scheme_by_id
from app.core.security import get_current_user

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get("")
async def list_schemes(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List all government agricultural schemes with optional filtering."""
    schemes = get_all_schemes(category=category, search=search)
    return {"schemes": schemes, "total": len(schemes)}


@router.get("/{scheme_id}")
async def get_scheme(
    scheme_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a specific scheme."""
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found",
        )
    return scheme
