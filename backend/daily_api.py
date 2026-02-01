"""Daily.co API integration functions for room and token management."""
import os
import time
import httpx
from fastapi import HTTPException
from loguru import logger
from dotenv import load_dotenv

load_dotenv(override=True)

DAILY_API_KEY = os.getenv("DAILY_API_KEY")
DAILY_API_URL = "https://api.daily.co/v1"


async def create_daily_room():
    """
    Creates a new Daily.co room with a 10-minute expiration.
    
    Returns:
        dict: Room data including 'url' and 'name' fields
        
    Raises:
        HTTPException: If room creation fails
    """
    # 1. Calculate expiration time (e.g., 10 minutes from now)
    duration_seconds = 10 * 60
    expiration_time = int(time.time() + duration_seconds)

    logger.info(f"Creating Daily room with expiration: {expiration_time}")
    logger.debug(f"DAILY_API_KEY present: {bool(DAILY_API_KEY)}")
    logger.debug(f"DAILY_API_URL: {DAILY_API_URL}")

    headers = {"Authorization": f"Bearer {DAILY_API_KEY}"}
    
    request_payload = {
        "properties": {
            # ESSENTIAL PROPERTIES
            "exp": expiration_time,       # Auto-delete room at this time
            "eject_at_room_exp": True,    # Kick participants when room expires
            
            # CAPACITY & PRIVACY
            "max_participants": 2,        # Only allow 2 people (User + Bot)
            
            # FEATURES
            "enable_chat": True,          # Useful if you want text fallbacks
            "start_video_off": False,     # Let user choose their camera state
            "start_audio_off": False,     # Let user choose their mic state
        }
    }
    logger.debug(f"Request payload: {request_payload}")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{DAILY_API_URL}/rooms",
                headers=headers,
                json=request_payload,
            )
            logger.info(f"Daily API response status: {resp.status_code}")
            logger.debug(f"Daily API response body: {resp.text}")
        except Exception as e:
            logger.error(f"Exception during Daily API call: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to call Daily API: {str(e)}")
    
    if resp.status_code != 200:
        logger.error(f"Failed to create room. Status: {resp.status_code}, Body: {resp.text}")
        raise HTTPException(status_code=resp.status_code, detail=f"Failed to create room: {resp.text}")
    
    room_data = resp.json()
    logger.info(f"Successfully created room: {room_data.get('name', 'unknown')}")
    return room_data


async def get_daily_token(room_name: str):
    """
    Creates a meeting token for a specific Daily.co room.
    
    Args:
        room_name: The name of the room to create a token for
        
    Returns:
        str: The meeting token
        
    Raises:
        HTTPException: If token creation fails
    """
    logger.info(f"Creating token for room: {room_name}")
    headers = {"Authorization": f"Bearer {DAILY_API_KEY}"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{DAILY_API_URL}/meeting-tokens",
                headers=headers,
                json={"properties": {"room_name": room_name, "is_owner": True}},
            )
            logger.info(f"Token API response status: {resp.status_code}")
            logger.debug(f"Token API response body: {resp.text}")
        except Exception as e:
            logger.error(f"Exception during token API call: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to call token API: {str(e)}")
    
    if resp.status_code != 200:
        logger.error(f"Failed to create token. Status: {resp.status_code}, Body: {resp.text}")
        raise HTTPException(status_code=resp.status_code, detail=f"Failed to create token: {resp.text}")
    
    token = resp.json()["token"]
    logger.info(f"Successfully created token for room: {room_name}")
    return token
