"""Video and vocab DB endpoints: add to DB and get vocabs for a video."""
from fastapi import APIRouter, HTTPException

from app.db import get_connection
from app.db.repositories import ensure_video, ensure_vocab, link_video_vocab
from app.schemas.vocab import VocabResponse

router = APIRouter()


@router.post("", status_code=201)
def add_vocab_to_db(payload: VocabResponse):
    """Persist extracted vocab for a video into the DB. Idempotent for same video."""
    conn = get_connection()
    try:
        conn.execute("BEGIN")
        video_id = ensure_video(conn, payload.video_id, summary=None)
        for item in payload.vocab:
            vocab_id = ensure_vocab(conn, item.word)
            link_video_vocab(conn, video_id, vocab_id, item.start_time, sentence=None)
        conn.commit()
        return {"ok": True, "video_id": video_id}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@router.get("/{video_id}/vocabs")
def get_vocabs_for_video(video_id: str):
    """Return all vocabs (with start_time, sentence) for a YouTube video_id."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id FROM videos WHERE youtube_video_id = ?", (video_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")
        internal_video_id = row[0]
        rows = conn.execute(
            """
            SELECT v.id, v.word, v.definition, v.difficulty, vv.start_time, vv.sentence
            FROM vocabs v
            JOIN video_vocab vv ON vv.vocab_id = v.id
            WHERE vv.video_id = ?
            """,
            (internal_video_id,),
        ).fetchall()
        return [
            {
                "id": r[0],
                "word": r[1],
                "definition": r[2],
                "difficulty": r[3],
                "start_time": r[4],
                "sentence": r[5],
            }
            for r in rows
        ]
    finally:
        conn.close()
