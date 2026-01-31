from youtube_transcript_api import YouTubeTranscriptApi

ytt_api = YouTubeTranscriptApi()

def format_fetched_transcript(fetched):
        lines = []
        for s in fetched.snippets:
            mm = int(s.start // 60)
            ss = int(s.start % 60)
            lines.append(f"[{mm:02d}:{ss:02d}] {s.text}")
        return "\n".join(lines)