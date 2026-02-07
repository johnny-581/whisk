"""API router configuration."""
from fastapi import APIRouter

from app.api.endpoints import vocab_live_chat
from app.api.endpoints import videos
from app.api.endpoints import video_analysis

api_router = APIRouter()

# Include chat endpoints
api_router.include_router(vocab_live_chat.router, prefix="/vocab-live-chat", tags=["vocab-live-chat"])
api_router.include_router(video_analysis.router, prefix="/video_analysis", tags=["video_analysis"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
