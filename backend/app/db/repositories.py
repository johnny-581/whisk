"""Repository helpers for vocab DB writes."""
import sqlite3
import uuid
from datetime import datetime, timezone


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_video(
    conn: sqlite3.Connection,
    youtube_video_id: str,
    summary: str | None = None,
) -> str:
    """Get or create video row; return internal id."""
    row = conn.execute(
        "SELECT id FROM videos WHERE youtube_video_id = ?",
        (youtube_video_id,),
    ).fetchone()
    if row:
        return row[0]
    video_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO videos (id, youtube_video_id, summary, created_at) VALUES (?, ?, ?, ?)",
        (video_id, youtube_video_id, summary, _now()),
    )
    return video_id


def ensure_vocab(
    conn: sqlite3.Connection,
    word: str,
    definition: str | None = None,
    difficulty: int | None = None,
) -> str:
    """Get or create vocab row; return internal id."""
    row = conn.execute("SELECT id FROM vocabs WHERE word = ?", (word,)).fetchone()
    if row:
        return row[0]
    vocab_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO vocabs (id, word, definition, difficulty, created_at) VALUES (?, ?, ?, ?, ?)",
        (vocab_id, word, definition, difficulty, _now()),
    )
    return vocab_id


def link_video_vocab(
    conn: sqlite3.Connection,
    video_id: str,
    vocab_id: str,
    start_time: str,
    sentence: str | None = None,
) -> None:
    """Insert video_vocab link; ignore if already exists."""
    conn.execute(
        "INSERT OR IGNORE INTO video_vocab (video_id, vocab_id, start_time, sentence) VALUES (?, ?, ?, ?)",
        (video_id, vocab_id, start_time, sentence),
    )
