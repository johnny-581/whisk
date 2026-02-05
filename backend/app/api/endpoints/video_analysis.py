from fastapi import APIRouter, HTTPException
from app.schemas.vocab import VocabResponse, VocabRequest
from app.services.youtube import ytt_api, format_fetched_transcript, extract_video_id
from google import genai
from app.core.config import settings


router = APIRouter()

client = genai.Client(api_key=settings.GOOGLE_API_KEY)


#request body: video_url: str
@router.post("", response_model=VocabResponse)
async def video_analysis(request: VocabRequest):

    transcript = ytt_api.fetch(request.video_id)
    transcript = format_fetched_transcript(transcript)
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"""
            You are helping a Japanese learner build vocabulary from English spoken content.

            Given the video_id: {request.video_id}, provide the video title, tags, and duration.

            From the transcript, extract vocabulary that corresponds to Japanese words at approximately JLPT N{request.user_level} level:
            - Prioritize common, concrete nouns (objects, people, places, concepts)
            - Prioritize high-frequency verbs (actions and states)
            - Include the timestamp (mm:ss) when each word is spoken


            {transcript}
        """,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": VocabResponse.model_json_schema(),
        },  
    )
    return VocabResponse(**response.parsed)