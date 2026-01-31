"""
API routes for backend.
"""

from fastapi import APIRouter
from pydantic import BaseModel

# Import endpoint routers
from app.api.endpoints import llm

# Create main API router
api_router = APIRouter()


# Include example endpoints
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])