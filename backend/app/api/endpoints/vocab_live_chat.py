"""Chat API endpoints for managing bot sessions."""
import os
import subprocess
import sys

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import BotSpawnError
from app.core.logger import logger
from app.services.daily import create_daily_room, get_daily_token

router = APIRouter()


def _spawn_bot(room_url: str, token: str) -> None:
    """
    Spawn the bot process as a subprocess.
    
    Args:
        room_url: The Daily.co room URL
        token: The authentication token for the room
        
    Raises:
        BotSpawnError: If bot spawning fails
    """
    try:
        # Get the backend directory (parent of app directory)
        backend_dir = settings.PROJECT_ROOT / "backend"
        
        # Spawn the bot as a subprocess using python module syntax
        subprocess.Popen(
            [
                sys.executable,  # Use the current Python interpreter
                "-m",
                "app.services.gemini_live_chat",
                "-u",
                room_url,
                "-t",
                token,
            ],
            cwd=str(backend_dir),  # Run from backend directory
            env=os.environ.copy(),
        )
        logger.info(f"Bot spawned for room: {room_url}")
    except Exception as e:
        logger.error(f"Failed to spawn bot: {e}")
        raise BotSpawnError(str(e))


@router.post("/start")
async def start_chat_session(request: Request) -> JSONResponse:
    """
    Start a new chat session by creating a Daily room and spawning the bot.
    
    Returns:
        JSONResponse with room_url and token (null for guest access)
        
    Raises:
        DailyAPIError: If room creation fails
        BotSpawnError: If bot spawning fails
    """
    logger.info("=" * 60)
    logger.info("Received start chat session request")

    try:
        # Step 1: Create a new Daily Room
        logger.info("Step 1: Creating Daily room...")
        room_data = await create_daily_room()
        room_url = room_data["url"]
        room_name = room_data["name"]
        logger.info(f"Room created successfully - URL: {room_url}, Name: {room_name}")

        # Step 2: Create a token for the Bot
        logger.info("Step 2: Creating bot token...")
        bot_token = await get_daily_token(room_name)
        logger.info("Bot token created successfully")

        # Step 3: Spawn the bot process
        logger.info("Step 3: Spawning bot process...")
        _spawn_bot(room_url, bot_token)
        logger.info("Bot process spawned successfully")

        # Step 4: Return the room URL to the client
        response_data = {
            "room_url": room_url,
            "token": None,  # Client joins as guest, or generate a client token if needed
        }
        logger.info(f"Returning response: {response_data}")
        logger.info("=" * 60)
        return JSONResponse(response_data)

    except Exception as e:
        logger.error(f"Error in start_chat_session: {type(e).__name__}: {str(e)}")
        logger.exception("Full traceback:")
        logger.info("=" * 60)
        raise
