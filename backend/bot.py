import os
import re
import uuid

from dotenv import load_dotenv
from loguru import logger

from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import LLMRunFrame
from pipecat.processors.frameworks.rtvi import RTVIServerMessageFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService
from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.turns.user_stop.turn_analyzer_user_turn_stop_strategy import (
    TurnAnalyzerUserTurnStopStrategy,
)
from pipecat.turns.user_turn_strategies import UserTurnStrategies
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection
from pipecat.frames.frames import Frame

# Regex to strip Gemini Live prosody control tokens like <ctrl46> that leak into transcripts
CTRL_TOKEN_PATTERN = re.compile(r"<ctrl\d+>", re.IGNORECASE)


class CtrlTokenFilter(FrameProcessor):
    """Strips Gemini Live prosody control tokens (e.g. <ctrl46>) from text frames."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if hasattr(frame, "text") and isinstance(getattr(frame, "text"), str):
            cleaned = CTRL_TOKEN_PATTERN.sub("", frame.text)
            if cleaned != frame.text:
                frame.text = cleaned

        await self.push_frame(frame, direction)


load_dotenv(override=True)

# Define constant target words
TARGET_WORDS = ["gemini", "robot", "future", "voice", "hackathon"]


async def main(room_url: str, token: str):
    # Initialize state - track remaining words
    remaining_words = list(TARGET_WORDS)

    transport = DailyTransport(
        room_url,
        token,
        "Chatbot",
        params=DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            video_out_enabled=False,
        ),
    )

    # Define Tool with Schema
    tools = [{
        "function_declarations": [{
            "name": "mark_word",
            "description": "Call this when the user says one of the target words.",
            "parameters": {
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "The target word said by the user",
                        "enum": TARGET_WORDS 
                    }
                },
                "required": ["word"]
            }
        }]
    }]

    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        voice_id="Charon",
        tools=tools
    )

    # Intelligent Tool Handler
    async def mark_word_handler(function_name, tool_call_id, args, llm, context, result_callback):
        word = args.get("word", "").lower()
        
        # Update state
        if word in remaining_words:
            remaining_words.remove(word)
            
            await task.queue_frames([RTVIServerMessageFrame(data={
                "type": "word_detected",
                "payload": word
            })])
            
            # Craft instructions for the next turn
            if not remaining_words:
                result_msg = f"The user said '{word}'. All words have been found! Congratulate the user and end the game."
            else:
                result_msg = (
                    f"Correct! The user said '{word}'. "
                    f"Remaining words to find: {', '.join(remaining_words)}. "
                    "Keep the conversation flowing and subtly guide them to say the remaining words."
                )
        else:
            result_msg = f"The word '{word}' was already found. Remaining words: {', '.join(remaining_words)}."

        logger.info(f"Tool result: {result_msg}")
        
        # This string is fed back to Gemini as the result of the tool call
        await result_callback(result_msg)

    llm.register_function("mark_word", mark_word_handler)

    messages = [
        {
            "role": "user",
            "content": (
                "You are a friendly game host robot. "
                "Your goal is to have a conversation and get the user to say specific secret words. "
                f"The secret words are: {', '.join(TARGET_WORDS)}. "
                "When you hear a secret word, call the 'mark_word' tool immediately. "
                "Do not tell the user the words directly. Give them hints or steer the topic. "
                "Start by introducing yourself and the game."
            ),
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


    pipeline = Pipeline(
        [
            transport.input(),
            user_aggregator,
            llm,
            CtrlTokenFilter(),
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