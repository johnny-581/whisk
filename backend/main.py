# server.py
import os
import subprocess
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from loguru import logger
import time

load_dotenv(override=True)

DAILY_API_KEY = os.getenv("DAILY_API_KEY")
DAILY_API_URL = "https://api.daily.co/v1"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def create_daily_room():
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