from fastapi import APIRouter, HTTPException
from app.schemas.vocab import VocabResponse, VocabRequest
from app.services.youtube import ytt_api, format_fetched_transcript, extract_video_id
from google import genai
from app.core.config import settings


router = APIRouter()

client = genai.Client(api_key=settings.GOOGLE_API_KEY)


#request body: video_url: str
@router.post("", response_model=VocabResponse)
async def get_vocab(request: VocabRequest):
    # try:
    #     video_id = extract_video_id(request.video_url)
    # except ValueError as e:
    #     raise HTTPException(status_code=400, detail=str(e))

    
    transcript = ytt_api.fetch(request.video_id)
    transcript = format_fetched_transcript(transcript)
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"""
            You are helping a japanese learner build vocabulary from english spoken content.
            {request.video_id} this is the video_id

            Given the video_id provide the title of the video and duration.

            From the provided transcript, extract vocabulary that is useful for learning:
            - Prioritize **common, concrete nouns** (objects, people, places, concepts)
            - Prioritize **high-frequency verbs** (actions and states)
            - Include the **timestamp** (mm:ss) when it is first clearly spoken


            {transcript}
        """,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": VocabResponse.model_json_schema(),
        },  
    )
    return VocabResponse(**response.parsed)