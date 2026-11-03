"""Mandi (market) prices router."""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.services.mandi_service import get_prices, get_states, get_commodities
from app.core.security import get_current_user

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])


@router.get("/prices")
async def prices(
    state: Optional[str] = Query(None),
    commodity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get filtered mandi prices."""
    return get_prices(state=state, commodity=commodity, search=search)


@router.get("/states")
async def states(current_user: dict = Depends(get_current_user)):
    """Get list of states with mandi data."""
    return {"states": get_states()}


@router.get("/commodities")
async def commodities(current_user: dict = Depends(get_current_user)):
    """Get list of available commodities."""
    return {"commodities": get_commodities()}
