from pydantic import BaseModel


class BaseGeminiRequest(BaseModel):
    session_id: str | None = None


class TimestampedWord(BaseModel):
    word: str
    definition: str
    start_time: str
    japanese_translation: str

class VocabRequest(BaseGeminiRequest):
    video_id: str
    user_level: int #1-5 for (n1-n5)

class VocabResponse(BaseModel):
    video_id: str
    vocab: list[TimestampedWord]
    title: str
    duration: str
    tags: list[str]