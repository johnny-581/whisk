from pydantic import BaseModel


class BaseGeminiRequest(BaseModel):
    session_id: str | None = None

class VideoAnalysisRequest(BaseGeminiRequest):
    video_url: str
    user_level: int #1-5 for (n1-n5)

class Vocab(BaseModel):
    """Vocabulary item with optional internal ID for DB responses"""
    id: str | None = None  # vocab internal UUID (only in responses)
    japanese_vocab: str
    pronunciation: str
    english_translation: str
    timestamp: str
    jlpt_level: int  # 1-5 for (n1-n5)

class Video(BaseModel):
    """Video with vocab, supports both ingestion and retrieval"""
    id: str | None = None  # internal UUID (only in responses)
    video_id: str  # YouTube video ID
    title: str
    tags: list[str]
    video_url: str
    duration: str
    summary: str
    vocab: list[Vocab]

class VideoSummary(BaseModel):
    """Summary response for listing videos (sidebar)"""
    id: str  # internal UUID
    video_id: str
    title: str
    tags: list[str]

class VideoCreateResponse(BaseModel):
    """Response after creating a video"""
    ok: bool
    video_id: str  # internal UUID