"""Pydantic schemas for chatbot."""
from pydantic import BaseModel, Field
from typing import Optional, List


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    language: str = Field("en", pattern=r"^(en|hi)$")
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    reply: str
    session_id: str
    language: str


class ChatHistoryMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class ChatSession(BaseModel):
    id: str
    title: str
    date: str
    preview: str
