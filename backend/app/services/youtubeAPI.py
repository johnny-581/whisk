from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

ytt_api = YouTubeTranscriptApi()

def format_fetched_transcript(fetched):
        lines = []
        for s in fetched.snippets:
            mm = int(s.start // 60)
            ss = int(s.start % 60)
            lines.append(f"[{mm:02d}:{ss:02d}] {s.text}")
        return "\n".join(lines)

def extract_video_id(url: str) -> str:
    parsed = urlparse(url)

    if parsed.hostname in ("www.youtube.com", "youtube.com"):
        return parse_qs(parsed.query).get("v", [None])[0]

    if parsed.hostname == "youtu.be":
        return parsed.path.lstrip("/")

    raise ValueError("Invalid YouTube URL")