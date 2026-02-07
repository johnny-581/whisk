"""Daily.co API integration functions for room and token management."""
import time

import httpx

from app.core.config import settings
from app.core.exceptions import DailyAPIError
from app.core.logger import logger


async def create_daily_room():
    """
    Creates a new Daily.co room with a 10-minute expiration.
    
    Returns:
        dict: Room data including 'url' and 'name' fields
        
    Raises:
        DailyAPIError: If room creation fails
    """
    # 1. Calculate expiration time (e.g., 10 minutes from now)
    expiration_time = int(time.time() + settings.DAILY_ROOM_DURATION_SECONDS)

    logger.info(f"Creating Daily room with expiration: {expiration_time}")
    logger.debug(f"DAILY_API_KEY present: {bool(settings.DAILY_API_KEY)}")
    logger.debug(f"DAILY_API_URL: {settings.DAILY_API_URL}")

    headers = {"Authorization": f"Bearer {settings.DAILY_API_KEY}"}
    
    request_payload = {
        "properties": {
            # ESSENTIAL PROPERTIES
            "exp": expiration_time,       # Auto-delete room at this time
            "eject_at_room_exp": True,    # Kick participants when room expires
            
            # CAPACITY & PRIVACY
            "max_participants": settings.DAILY_MAX_PARTICIPANTS,  # Only allow 2 people (User + Bot)
            
            # FEATURES
            "enable_chat": True,          # Useful if you want text fallbacks
            "enable_transcription": True, # Enable ASR for user transcripts
            "start_video_off": False,     # Let user choose their camera state
            "start_audio_off": False,     # Let user choose their mic state
        }
    }
    logger.debug(f"Request payload: {request_payload}")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{settings.DAILY_API_URL}/rooms",
                headers=headers,
                json=request_payload,
            )
            logger.info(f"Daily API response status: {resp.status_code}")
            logger.debug(f"Daily API response body: {resp.text}")
        except Exception as e:
            logger.error(f"Exception during Daily API call: {e}")
            raise DailyAPIError(f"Failed to call Daily API: {str(e)}")
    
    if resp.status_code != 200:
        logger.error(f"Failed to create room. Status: {resp.status_code}, Body: {resp.text}")
        raise DailyAPIError(f"Failed to create room: {resp.text}", resp.status_code)
    
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
        DailyAPIError: If token creation fails
    """
    logger.info(f"Creating token for room: {room_name}")
    headers = {"Authorization": f"Bearer {settings.DAILY_API_KEY}"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{settings.DAILY_API_URL}/meeting-tokens",
                headers=headers,
                json={"properties": {"room_name": room_name, "is_owner": True}},
            )
            logger.info(f"Token API response status: {resp.status_code}")
            logger.debug(f"Token API response body: {resp.text}")
        except Exception as e:
            logger.error(f"Exception during token API call: {e}")
            raise DailyAPIError(f"Failed to call token API: {str(e)}")
    
    if resp.status_code != 200:
        logger.error(f"Failed to create token. Status: {resp.status_code}, Body: {resp.text}")
        raise DailyAPIError(f"Failed to create token: {resp.text}", resp.status_code)
    
    token = resp.json()["token"]
    logger.info(f"Successfully created token for room: {room_name}")
    return token
