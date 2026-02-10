from urllib.parse import urlparse, parse_qs

from apify_client import ApifyClient

from app.core.config import settings


def _make_apify_client():
    """Initialize the ApifyClient with API token."""
    return ApifyClient(settings.APIFY_API_TOKEN)


apify_client = _make_apify_client()


def get_video_transcript(video_url: str, target_language: str = "ja") -> dict:
    """
    Fetch video transcript using Apify YouTube Transcript Scraper.
    
    Args:
        video_url: Full YouTube video URL
        target_language: Target language code (default: "ja" for Japanese)
    
    Returns:
        dict: Raw transcript data from Apify
    """
    run_input = {
        "videoUrl": video_url,
        "targetLanguage": target_language,
    }
    
    # Run the Actor and wait for it to finish
    run = apify_client.actor("faVsWy9VTSNVIhWpR").call(run_input=run_input)
    
    # Fetch results from the run's dataset
    items = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
    
    if not items:
        raise ValueError("No transcript data returned from Apify")
    
    return items[0]


def format_transcript(transcript_data: dict) -> str:
    """
    Format transcript data into a readable string with timestamps.
    
    The Apify response structure is:
    [
      {
        "data": [
          {"start": "3.336", "dur": "2.169", "text": "..."},
          ...
        ]
      }
    ]
    
    Args:
        transcript_data: Raw transcript data from Apify
    
    Returns:
        str: Formatted transcript with timestamps
    """
    lines = []
    
    # Handle Apify's response structure
    if "data" in transcript_data:
        segments = transcript_data["data"]
        
        if isinstance(segments, list):
            for segment in segments:
                if isinstance(segment, dict):
                    # Convert start time from string to float
                    start = float(segment.get("start", 0))
                    text = segment.get("text", "")
                    
                    # Format timestamp as [MM:SS]
                    mm = int(start // 60)
                    ss = int(start % 60)
                    lines.append(f"[{mm:02d}:{ss:02d}] {text}")
    
    if not lines:
        # Fallback: return string representation if format is unexpected
        return str(transcript_data)
    
    return "\n".join(lines)


def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL."""
    parsed = urlparse(url)

    if parsed.hostname in ("www.youtube.com", "youtube.com"):
        return parse_qs(parsed.query).get("v", [None])[0]

    if parsed.hostname == "youtu.be":
        return parsed.path.lstrip("/")

    raise ValueError("Invalid YouTube URL")