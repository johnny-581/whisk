import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.services.gemini import client
from app.schemas import VocabResponse, VocabRequest
from app.services.youtubeAPI import ytt_api, format_fetched_transcript, extract_video_id







router = APIRouter()

@router.post("/vocab", response_model=VocabResponse)
async def get_vocab(request: VocabRequest):



    try:
        video_id = extract_video_id(request.video_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    
    transcript = ytt_api.fetch(video_id)
    transcript = format_fetched_transcript(transcript)
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"""
            You are helping a language learner build vocabulary from spoken content.

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
