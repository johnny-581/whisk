"""Video and vocab DB endpoints: add to DB and get vocabs for a video."""
from fastapi import APIRouter, HTTPException

from app.db import get_connection
from app.db.repositories import ensure_video, ensure_vocab, link_video_vocab
from app.schemas.video import Video, Vocab, VideoSummary, VideoCreateResponse

router = APIRouter()


@router.get("", response_model=list[VideoSummary])
def list_videos():
    """
    GET /videos - List all videos for sidebar.
    Returns only id, title, and tags for each video.
    """
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, title, tags FROM videos ORDER BY created_at DESC"
        ).fetchall()
        return [
            VideoSummary(
                id=row[0],
                title=row[1],
                tags=row[2].split(",") if row[2] else []
            )
            for row in rows
        ]
    finally:
        conn.close()


@router.get("/{video_id}", response_model=Video)
def get_video(video_id: str):
    """
    GET /videos/{video_id} - Get full video details.
    Returns complete video information including all vocab.
    video_id can be either the internal UUID or YouTube video ID.
    """
    conn = get_connection()
    try:
        # Try to find by internal ID first, then by YouTube video ID
        row = conn.execute(
            """SELECT id, youtube_video_id, title, tags, video_url, duration, summary 
               FROM videos 
               WHERE id = ? OR youtube_video_id = ?""",
            (video_id, video_id)
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")
        
        internal_video_id = row[0]
        
        # Fetch all vocab for this video
        vocab_rows = conn.execute(
            """
            SELECT v.id, v.japanese_vocab, v.pronunciation, v.english_translation, v.jlpt_level, vv.timestamp
            FROM vocabs v
            JOIN video_vocab vv ON vv.vocab_id = v.id
            WHERE vv.video_id = ?
            ORDER BY vv.timestamp
            """,
            (internal_video_id,),
        ).fetchall()
        
        vocab_list = [
            Vocab(
                id=r[0],
                japanese_vocab=r[1],
                pronunciation=r[2] or "",
                english_translation=r[3] or "",
                timestamp=r[5],
                jlpt_level=r[4] or 5
            )
            for r in vocab_rows
        ]
        
        return Video(
            id=row[0],
            video_id=row[1],
            title=row[2],
            tags=row[3].split(",") if row[3] else [],
            video_url=row[4],
            duration=row[5],
            summary=row[6] or "",
            vocab=vocab_list
        )
    finally:
        conn.close()


@router.post("", status_code=201, response_model=VideoCreateResponse)
def create_video(payload: Video):
    """
    POST /videos - Ingest a new video with vocab.
    Persists video metadata and all associated vocabulary.
    Idempotent: updates existing video if video_id already exists.
    """
    conn = get_connection()
    try:
        conn.execute("BEGIN")
        
        # Create or update video
        internal_video_id = ensure_video(
            conn,
            youtube_video_id=payload.video_id,
            title=payload.title,
            tags=payload.tags,
            video_url=payload.video_url,
            duration=payload.duration,
            summary=payload.summary
        )
        
        # Add all vocab items
        for item in payload.vocab:
            vocab_id = ensure_vocab(
                conn,
                japanese_vocab=item.japanese_vocab,
                pronunciation=item.pronunciation,
                english_translation=item.english_translation,
                jlpt_level=item.jlpt_level
            )
            link_video_vocab(
                conn,
                video_id=internal_video_id,
                vocab_id=vocab_id,
                timestamp=item.timestamp,
                sentence=None
            )
        
        conn.commit()
        return VideoCreateResponse(ok=True, video_id=internal_video_id)
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@router.delete("/{video_id}", status_code=204)
def delete_video(video_id: str):
    """
    DELETE /videos/{video_id} - Delete a video and its associations.
    video_id can be either the internal UUID or YouTube video ID.
    Cascades to delete all video_vocab associations.
    """
    conn = get_connection()
    try:
        conn.execute("BEGIN")
        
        # Find the video
        row = conn.execute(
            "SELECT id FROM videos WHERE id = ? OR youtube_video_id = ?",
            (video_id, video_id)
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")
        
        internal_video_id = row[0]
        
        # Delete video_vocab associations first (foreign key constraint)
        conn.execute(
            "DELETE FROM video_vocab WHERE video_id = ?",
            (internal_video_id,)
        )
        
        # Delete the video
        conn.execute(
            "DELETE FROM videos WHERE id = ?",
            (internal_video_id,)
        )
        
        conn.commit()
        return None  # 204 No Content
    except HTTPException:
        conn.rollback()
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
