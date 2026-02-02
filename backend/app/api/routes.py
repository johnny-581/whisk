"""API router configuration."""
from fastapi import APIRouter

from app.api.endpoints import vocab_live_chat
from app.api.endpoints import vocab_extract

api_router = APIRouter()

# Include chat endpoints
api_router.include_router(vocab_live_chat.router, prefix="/vocab-live-chat", tags=["vocab-live-chat"])
api_router.include_router(vocab_extract.router, prefix="/vocab-extract", tags=["vocab-extract"])
