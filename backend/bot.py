import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger
from PIL import Image

from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import (
    BotStartedSpeakingFrame,
    BotStoppedSpeakingFrame,
    Frame,
    LLMRunFrame,
    OutputImageRawFrame,
    SpriteFrame,
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService
from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.turns.user_stop.turn_analyzer_user_turn_stop_strategy import (
    TurnAnalyzerUserTurnStopStrategy,
)
from pipecat.turns.user_turn_strategies import UserTurnStrategies

load_dotenv(override=True)

# --- Asset Loading ---
sprites = []
# Ensure we find assets relative to this file location
script_dir = Path(__file__).parent

try:
    for i in range(1, 26):
        full_path = script_dir / f"assets/robot0{i}.png"
        with Image.open(full_path) as img:
            sprites.append(OutputImageRawFrame(image=img.tobytes(), size=img.size, format=img.format))
    
    # Create smooth animation
    flipped = sprites[::-1]
    sprites.extend(flipped)
    
    quiet_frame = sprites[0]
    talking_frame = SpriteFrame(images=sprites)
except Exception as e:
    logger.error(f"Failed to load sprites: {e}. Ensure 'assets/robot0X.png' exists.")
    sys.exit(1)


class TalkingAnimation(FrameProcessor):
    def __init__(self):
        super().__init__()
        self._is_talking = False

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, BotStartedSpeakingFrame):
            if not self._is_talking:
                await self.push_frame(talking_frame)
                self._is_talking = True
        elif isinstance(frame, BotStoppedSpeakingFrame):
            await self.push_frame(quiet_frame)
            self._is_talking = False

        await self.push_frame(frame, direction)


async def main(room_url: str, token: str):
    transport = DailyTransport(
        room_url,
        token,
        "Chatbot",
        params=DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_out_enabled=True,
            video_out_width=1024,
            video_out_height=576,
        ),
    )

    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        voice_id="Charon", 
    )

    messages = [
        {
            "role": "user",
            "content": "You are Chatbot, a friendly, helpful robot. Your goal is to demonstrate your capabilities in a succinct way. Respond to what the user said in a creative and helpful way, but keep your responses brief. Start by introducing yourself.",
        },
    ]

    context = LLMContext(messages)
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            user_turn_strategies=UserTurnStrategies(
                stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())]
            ),
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
        ),
    )

    ta = TalkingAnimation()

    pipeline = Pipeline(
        [
            transport.input(),
            user_aggregator,
            llm,
            ta,
            transport.output(),
            assistant_aggregator,
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
    )

    await task.queue_frame(quiet_frame)

    @task.rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Client connected")

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Client disconnected")
        await task.cancel()

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)


if __name__ == "__main__":
    # We expect arguments: python bot.py -u URL -t TOKEN
    import argparse
    parser = argparse.ArgumentParser(description="Pipecat Bot")
    parser.add_argument("-u", "--url", type=str, required=True, help="Daily Room URL")
    parser.add_argument("-t", "--token", type=str, required=True, help="Daily Room Token")
    args = parser.parse_args()

    import asyncio
    asyncio.run(main(args.url, args.token))