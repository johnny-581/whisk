from fastapi import APIRouter
from app.schemas.video import Video, VideoAnalysisRequest
from app.services.youtube import get_video_transcript, format_transcript, extract_video_id
from google import genai
from app.core.config import settings
from app.core.prompts import get_video_analysis_prompt


router = APIRouter()

client = genai.Client(api_key=settings.GOOGLE_API_KEY)


#request body: video_url: str
@router.post("", response_model=Video)
async def video_analysis(request: VideoAnalysisRequest):
    print(f"Analyzing video: {request.video_url}")

    video_id = extract_video_id(request.video_url)
    print(f"Extracting transcript - Video ID: {video_id}")
    
    # Fetch transcript using Apify (default language is Japanese)
    transcript_data = get_video_transcript(request.video_url, target_language="ja")
    transcript = format_transcript(transcript_data)
    print(f"Transcript Extracted!")
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=get_video_analysis_prompt(video_id, request.video_url, transcript, request.user_level),
        config={
            "response_mime_type": "application/json",
            "response_json_schema": Video.model_json_schema(),
        },
    )
    return Video(**response.parsed)