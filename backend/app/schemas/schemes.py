"""Pydantic schemas for government schemes."""
from pydantic import BaseModel
from typing import List, Optional


class SchemeResponse(BaseModel):
    id: str
    title: str
    ministry: str
    category: str
    benefit: str
    eligibility: str
    deadline: str
    status: str
    link: str
    description: str
    documents: List[str]
