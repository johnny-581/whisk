#!/usr/bin/env python3
"""
Migration script to update database schema from old field names to new ones.
Run this once to migrate existing data.

Old schema -> New schema:
- vocabs.word -> vocabs.japanese_vocab
- vocabs.definition -> vocabs.english_translation
- vocabs.difficulty -> vocabs.jlpt_level
- video_vocab.start_time -> video_vocab.timestamp
"""
import sqlite3
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings


def migrate_database():
    """Migrate the database schema to match the updated field names."""
    db_path = Path(settings.DATABASE_PATH)
    
    if not db_path.exists():
        print(f"Database not found at {db_path}. No migration needed.")
        return
    
    print(f"Migrating database at {db_path}...")
    conn = sqlite3.connect(str(db_path))
    
    try:
        # Check if migration is needed by checking if old columns exist
        cursor = conn.execute("PRAGMA table_info(vocabs)")
        columns = {row[1] for row in cursor.fetchall()}
        
        if "japanese_vocab" in columns:
            print("Database already migrated. No action needed.")
            return
        
        if "word" not in columns:
            print("Unexpected database schema. Please check manually.")
            return
        
        print("Starting migration...")
        conn.execute("BEGIN")
        
        # 1. Create new vocabs table with updated schema
        print("Creating new vocabs table...")
        conn.execute("""
            CREATE TABLE vocabs_new (
                id TEXT PRIMARY KEY,
                japanese_vocab TEXT UNIQUE NOT NULL,
                pronunciation TEXT,
                english_translation TEXT,
                jlpt_level INTEGER,
                created_at TEXT NOT NULL
            )
        """)
        
        # 2. Copy data from old to new vocabs table
        print("Copying vocab data...")
        conn.execute("""
            INSERT INTO vocabs_new (id, japanese_vocab, pronunciation, english_translation, jlpt_level, created_at)
            SELECT id, word, pronunciation, definition, difficulty, created_at
            FROM vocabs
        """)
        
        # 3. Create new video_vocab table with updated schema
        print("Creating new video_vocab table...")
        conn.execute("""
            CREATE TABLE video_vocab_new (
                video_id TEXT NOT NULL,
                vocab_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                sentence TEXT,
                PRIMARY KEY (video_id, vocab_id),
                FOREIGN KEY (video_id) REFERENCES videos(id),
                FOREIGN KEY (vocab_id) REFERENCES vocabs_new(id)
            )
        """)
        
        # 4. Copy data from old to new video_vocab table
        print("Copying video_vocab data...")
        conn.execute("""
            INSERT INTO video_vocab_new (video_id, vocab_id, timestamp, sentence)
            SELECT video_id, vocab_id, start_time, sentence
            FROM video_vocab
        """)
        
        # 5. Drop old tables
        print("Dropping old tables...")
        conn.execute("DROP TABLE video_vocab")
        conn.execute("DROP TABLE vocabs")
        
        # 6. Rename new tables to original names
        print("Renaming new tables...")
        conn.execute("ALTER TABLE vocabs_new RENAME TO vocabs")
        conn.execute("ALTER TABLE video_vocab_new RENAME TO video_vocab")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate_database()
