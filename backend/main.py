import os
import uvicorn
from fastapi import FastAPI, WebSocket
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask
from pipecat.services.google.gemini_live import GeminiLiveLLMService
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)
from pipecat.serializers.protobuf import ProtobufFrameSerializer
from dotenv import load_dotenv

load_dotenv()

# Ensure you have your Google API key set
# export GOOGLE_API_KEY=your_api_key
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # 1. Configure the Transport (FastAPI <-> Client)
    # The 'serializers' help decode/encode audio frames for the client.
    # ProtobufFrameSerializer is commonly used with the Pipecat client SDKs.
    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_out_enabled=True,
            add_wav_header=False,
            serializer=ProtobufFrameSerializer(use_sidebar=True) 
        )
    )

    # 2. Configure the Service (Gemini Live)
    # Gemini Live handles both listening (STT) and speaking (TTS) natively.
    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        voice_id="Puck",  # Options: Puck, Charon, Kore, Fenrir, Aoede
    )

    # 3. Build the Pipeline
    # Data flows: Transport Input -> Gemini Live -> Transport Output
    pipeline = Pipeline(
        [
            transport.input(),   # Receive audio from client
            llm,                 # Send audio to Gemini, get audio back
            transport.output(),  # Send audio back to client
        ]
    )

    # 4. Run the Task
    task = PipelineTask(pipeline)
    runner = PipelineRunner()
    
    try:
        await runner.run(task)
    except Exception as e:
        print(f"Connection closed: {e}")
    finally:
        # Cleanup if needed
        pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765)