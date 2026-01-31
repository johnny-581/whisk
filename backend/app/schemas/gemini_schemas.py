
from pydantic import BaseModel


class BaseGeminiRequest(BaseModel):
    session_id: str | None = None


class TimestampedWord(BaseModel):
    word: str
    start_time: str


class VocabResponse(BaseModel):
    video_id: str
    vocab: list[TimestampedWord]