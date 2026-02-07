"""Repository helpers for vocab DB writes."""
import sqlite3
import uuid
from datetime import datetime, timezone


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_video(
    conn: sqlite3.Connection,
    youtube_video_id: str,
    title: str,
    tags: list[str],
    video_url: str,
    duration: str,
    summary: str | None = None,
) -> str:
    """Get or create video row; return internal id."""
    row = conn.execute(
        "SELECT id FROM videos WHERE youtube_video_id = ?",
        (youtube_video_id,),
    ).fetchone()
    if row:
        # Update existing video with new data
        conn.execute(
            """UPDATE videos 
               SET title = ?, tags = ?, video_url = ?, duration = ?, summary = ?
               WHERE id = ?""",
            (title, ",".join(tags), video_url, duration, summary, row[0]),
        )
        return row[0]
    video_id = str(uuid.uuid4())
    conn.execute(
        """INSERT INTO videos 
           (id, youtube_video_id, title, tags, video_url, duration, summary, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (video_id, youtube_video_id, title, ",".join(tags), video_url, duration, summary, _now()),
    )
    return video_id


def ensure_vocab(
    conn: sqlite3.Connection,
    japanese_vocab: str,
    pronunciation: str | None = None,
    english_translation: str | None = None,
    jlpt_level: int | None = None,
) -> str:
    """Get or create vocab row; return internal id."""
    row = conn.execute("SELECT id FROM vocabs WHERE japanese_vocab = ?", (japanese_vocab,)).fetchone()
    if row:
        # Update existing vocab with new data
        conn.execute(
            """UPDATE vocabs 
               SET pronunciation = ?, english_translation = ?, jlpt_level = ?
               WHERE id = ?""",
            (pronunciation, english_translation, jlpt_level, row[0]),
        )
        return row[0]
    vocab_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO vocabs (id, japanese_vocab, pronunciation, english_translation, jlpt_level, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (vocab_id, japanese_vocab, pronunciation, english_translation, jlpt_level, _now()),
    )
    return vocab_id


def link_video_vocab(
    conn: sqlite3.Connection,
    video_id: str,
    vocab_id: str,
    timestamp: str,
    sentence: str | None = None,
) -> None:
    """Insert video_vocab link; ignore if already exists."""
    conn.execute(
        "INSERT OR IGNORE INTO video_vocab (video_id, vocab_id, timestamp, sentence) VALUES (?, ?, ?, ?)",
        (video_id, vocab_id, timestamp, sentence),
    )
