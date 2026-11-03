"""Pydantic schemas for mandi / market prices."""
from pydantic import BaseModel
from typing import List, Optional


class MandiPrice(BaseModel):
    commodity: str
    variety: str
    market: str
    state: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str = "quintal"
    date: str


class MandiPricesResponse(BaseModel):
    prices: List[MandiPrice]
    total: int
    last_updated: str
