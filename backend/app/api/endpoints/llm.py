from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse


router = APIRouter()

@router.post("/query")
