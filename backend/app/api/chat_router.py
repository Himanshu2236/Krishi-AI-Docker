"""Chatbot router."""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.chat_service import chat_with_ai, get_chat_sessions, get_session_history
from app.core.security import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    data: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a message to the AI farming chatbot."""
    result = await chat_with_ai(
        user_id=current_user["id"],
        message=data.message,
        language=data.language,
        session_id=data.session_id,
    )
    return result


@router.get("/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    """List user's chat sessions."""
    sessions = await get_chat_sessions(current_user["id"])
    return {"sessions": sessions}


@router.get("/history")
async def get_history(
    session_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get chat history or user's chat sessions."""
    if session_id:
        messages = await get_session_history(current_user["id"], session_id)
        return {"messages": messages}
    sessions = await get_chat_sessions(current_user["id"])
    return {"sessions": sessions}


@router.get("/history/{session_id}")
async def session_history(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get messages for a specific chat session."""
    messages = await get_session_history(current_user["id"], session_id)
    return {"messages": messages}
