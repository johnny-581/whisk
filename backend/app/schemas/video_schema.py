from pydantic import BaseModel


class BaseGeminiRequest(BaseModel):
    session_id: str | None = None

class VideoAnalysisRequest(BaseGeminiRequest):
    video_url: str
    user_level: int #1-5 for (n1-n5)

class Vocab(BaseModel): # renamed from TimestampedWord
    japanese_vocab: str # renamed
    pronunciation: str # new field
    english_translation: str # renamed
    timestamp: str # renamed
    jlpt_level: int # 1-5 for (n1-n5)

class VideoAnalysisResponse(BaseModel):
    video_id: str
    video_url: str
    title: str
    duration: str
    tags: list[str]
    summary: str # new field
    vocab: list[Vocab]