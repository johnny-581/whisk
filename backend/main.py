# server.py
import os
import subprocess
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from loguru import logger

from daily_api import create_daily_room, get_daily_token

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def spawn_bot(room_url: str, token: str):
    """Spawns the bot process independent of the FastAPI event loop."""
    try:
        # We spawn the bot.py script as a subprocess
        # process will detach and run until the user disconnects (handled in bot.py)
        subprocess.Popen(
            ["python", "bot.py", "-u", room_url, "-t", token],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            env=os.environ.copy()
        )
        logger.info(f"Bot spawned for room: {room_url}")
    except Exception as e:
        logger.error(f"Failed to spawn bot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start")
async def start_agent(request: Request):
    """
    Creates a Daily room, spawns the bot, and returns the room URL 
    so the web client can join.
    """
    logger.info("=" * 60)
    logger.info("Received start request")
    
    try:
        # 1. Create a new Daily Room
        logger.info("Step 1: Creating Daily room...")
        room_data = await create_daily_room()
        room_url = room_data["url"]
        room_name = room_data["name"]
        logger.info(f"Room created successfully - URL: {room_url}, Name: {room_name}")

        # 2. Create a token for the Bot
        logger.info("Step 2: Creating bot token...")
        bot_token = await get_daily_token(room_name)
        logger.info("Bot token created successfully")

        # 3. Spawn the Pipecat Bot process
        logger.info("Step 3: Spawning bot process...")
        spawn_bot(room_url, bot_token)
        logger.info("Bot process spawned successfully")

        # 4. Return the room URL to the client (client can join without token or you can gen one)
        response_data = {
            "room_url": room_url, 
            "token": None # Client joins as guest, or generate a client token if needed
        }
        logger.info(f"Returning response: {response_data}")
        logger.info("=" * 60)
        return JSONResponse(response_data)
    
    except Exception as e:
        logger.error(f"Error in start_agent: {type(e).__name__}: {str(e)}")
        logger.exception("Full traceback:")
        logger.info("=" * 60)
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)