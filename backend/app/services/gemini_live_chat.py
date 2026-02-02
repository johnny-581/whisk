"""Gemini Live Chat service for managing voice conversations with AI."""
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.processors.frameworks.rtvi import RTVIServerMessageFrame
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService
from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.turns.user_stop.turn_analyzer_user_turn_stop_strategy import (
    TurnAnalyzerUserTurnStopStrategy,
)
from pipecat.turns.user_turn_strategies import UserTurnStrategies

from app.core.config import settings
from app.core.logger import logger
from app.core.prompt import get_system_messages

# Load target words from project root
TARGET_WORDS = ["apple", "banana", "cherry", "date", "elderberry"]


def _create_tools_schema(target_words: list[str]) -> list[dict]:
    """Create the tools schema for Gemini function calling."""
    return [{
        "function_declarations": [{
            "name": "mark_word",
            "description": "Call this when the user uses one of the target words in a correct and complete sentence.",
            "parameters": {
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "The target word said by the user",
                        "enum": target_words
                    }
                },
                "required": ["word"]
            }
        }]
    }]


async def run_bot(room_url: str, token: str) -> None:
    """
    Run the Gemini Live Chat bot in a Daily.co room.
    
    Args:
        room_url: The Daily.co room URL to join
        token: The authentication token for the room
    """
    logger.info(f"Starting bot for room: {room_url}")
    
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

    # Create tools schema
    tools = _create_tools_schema(TARGET_WORDS)

    llm = GeminiLiveLLMService(
        api_key=settings.GOOGLE_API_KEY,
        voice_id=settings.GEMINI_VOICE_ID,
        tools=tools
    )

    # Define the tool handler for marking words
    async def mark_word_handler(function_name, tool_call_id, args, llm, context, result_callback):
        """Handle the mark_word tool call when a target word is detected."""
        word = args.get("word", "").lower()
        
        # Update state
        if word in remaining_words:
            remaining_words.remove(word)
            
            # Notify frontend about detected word
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

    messages = get_system_messages(TARGET_WORDS)

    context = LLMContext(messages)
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            user_turn_strategies=UserTurnStrategies(
                stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())]
            ),
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=settings.VAD_STOP_SECS)),
        ),
    )


    pipeline = Pipeline(
        [
            transport.input(),
            user_aggregator,
            llm,
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
    
    logger.info("Bot session completed")


if __name__ == "__main__":
    import argparse
    import asyncio
    
    # We expect arguments: python -m app.services.gemini_live_chat -u URL -t TOKEN
    parser = argparse.ArgumentParser(description="Gemini Live Chat Bot")
    parser.add_argument("-u", "--url", type=str, required=True, help="Daily Room URL")
    parser.add_argument("-t", "--token", type=str, required=True, help="Daily Room Token")
    args = parser.parse_args()

    asyncio.run(run_bot(args.url, args.token))