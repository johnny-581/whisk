from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig

from app.core.config import settings


def _make_ytt_api():
    """Build YouTubeTranscriptApi with optional proxy (e.g. Bright Data)."""
    proxy_config = None
    if settings.PROXY_URL:
        proxy_config = GenericProxyConfig(
            http_url=settings.PROXY_URL,
            https_url=settings.PROXY_URL,
        )
    return YouTubeTranscriptApi(proxy_config=proxy_config)


ytt_api = _make_ytt_api()

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