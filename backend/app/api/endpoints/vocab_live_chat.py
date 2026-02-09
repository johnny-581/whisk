"""Chat API endpoints for managing bot sessions."""
import json
import os
import subprocess
import sys

from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import BotSpawnError
from app.core.logger import logger
from app.services.daily import create_daily_room, get_daily_token

router = APIRouter()


def _spawn_bot(room_url: str, token: str, target_words: list[str], summary: str = "") -> None:
    """
    Spawn the bot process as a subprocess.
    
    Args:
        room_url: The Daily.co room URL
        token: The authentication token for the room
        target_words: List of vocabulary words to practice
        summary: Video summary to provide context for the conversation
        
    Raises:
        BotSpawnError: If bot spawning fails
    """
    try:
        # Get the backend directory (parent of app directory)
        backend_dir = settings.PROJECT_ROOT / "backend"
        
        # Spawn the bot as a subprocess using python module syntax
        cmd = [
            sys.executable,  # Use the current Python interpreter
            "-m",
            "app.services.gemini_live_chat",
            "-u",
            room_url,
            "-t",
            token,
        ]
        if target_words:
            cmd.extend(["-w", json.dumps(target_words, ensure_ascii=False)])
        if summary:
            cmd.extend(["-s", summary])

        subprocess.Popen(
            cmd,
            cwd=str(backend_dir),  # Run from backend directory
            env=os.environ.copy(),
        )
        logger.info(f"Bot spawned for room: {room_url}")
    except Exception as e:
        logger.error(f"Failed to spawn bot: {e}")
        raise BotSpawnError(str(e))


@router.post("/start")
async def start_chat_session(
    request: Request, background_tasks: BackgroundTasks
) -> JSONResponse:
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
        payload = {}
        try:
            payload = await request.json()
        except Exception:
            payload = {}

        raw_vocab = payload.get("vocab", []) if isinstance(payload, dict) else []
        print(f"Raw vocab: {raw_vocab}")
        
        target_words: list[str] = []
        if isinstance(raw_vocab, list):
            for entry in raw_vocab:
                if isinstance(entry, str):
                    word = entry.strip()
                elif isinstance(entry, dict):
                    word = str(entry.get("japanese_vocab", "")).strip()
                else:
                    word = ""
                if word:
                    target_words.append(word)
        
        print(f"Target words changed: {target_words}")
        
        # Extract video summary from payload
        summary = payload.get("summary", "") if isinstance(payload, dict) else ""
        print(f"Video summary: {summary}")

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

        # Step 3: Spawn the bot process (background to reduce latency)
        logger.info("Step 3: Queueing bot process spawn...")
        background_tasks.add_task(_spawn_bot, room_url, bot_token, target_words, summary)
        logger.info("Bot process queued")

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
