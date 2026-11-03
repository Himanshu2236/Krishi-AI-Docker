"""Mandi (market) prices router."""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.services.mandi_service import get_prices, get_states, get_commodities, get_districts, get_markets
from app.core.security import get_current_user

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])


@router.get("/prices")
async def prices(
    state: Optional[str] = Query(None),
    commodity: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get filtered mandi prices with support for state, district, market, commodity, and text search."""
    return get_prices(state=state, commodity=commodity, district=district, market=market, search=search)


@router.get("/states")
async def states(current_user: dict = Depends(get_current_user)):
    """Get list of states with mandi data."""
    return {"states": get_states()}


@router.get("/commodities")
async def commodities(current_user: dict = Depends(get_current_user)):
    """Get list of available commodities."""
    return {"commodities": get_commodities()}


@router.get("/districts")
async def districts(
    state: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get list of districts, optionally filtered by state."""
    return {"districts": get_districts(state=state)}


@router.get("/markets")
async def markets(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """Get list of markets, optionally filtered by state or district."""
    return {"markets": get_markets(state=state, district=district)}
