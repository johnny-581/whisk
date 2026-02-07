"""Database module: SQLite connection and schema for vocab storage."""
import sqlite3
from pathlib import Path

from app.core.config import settings


def get_connection() -> sqlite3.Connection:
    """
    Open a short-lived SQLite connection to the configured database path.
    Caller must close the connection when done.
    """
    path = Path(settings.DATABASE_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    """
    Create vocab tables if they do not exist.
    Safe to call on every startup.
    """
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            youtube_video_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            tags TEXT,
            video_url TEXT NOT NULL,
            duration TEXT NOT NULL,
            summary TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vocabs (
            id TEXT PRIMARY KEY,
            japanese_vocab TEXT UNIQUE NOT NULL,
            pronunciation TEXT,
            english_translation TEXT,
            jlpt_level INTEGER,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS video_vocab (
            video_id TEXT NOT NULL,
            vocab_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            sentence TEXT,
            PRIMARY KEY (video_id, vocab_id),
            FOREIGN KEY (video_id) REFERENCES videos(id),
            FOREIGN KEY (vocab_id) REFERENCES vocabs(id)
        );
    """)
    conn.commit()
