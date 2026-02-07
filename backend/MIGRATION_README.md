# Database Schema Migration

## Changes Made

The database schema has been updated to match the Pydantic models in `app/schemas/video.py`. The following field names were changed:

### `vocabs` table:

- `word` → `japanese_vocab`
- `definition` → `english_translation`
- `difficulty` → `jlpt_level`

### `video_vocab` table:

- `start_time` → `timestamp`

## Files Updated

1. **`app/db/__init__.py`** - Updated schema definitions
2. **`app/db/repositories.py`** - Updated function parameters and SQL queries
3. **`app/api/endpoints/videos.py`** - Updated SQL queries and field mappings

## Migration Instructions

If you have an existing database with data, run the migration script:

```bash
cd backend
python migrate_schema.py
```

The migration script will:

1. Check if migration is needed
2. Create new tables with updated schema
3. Copy all existing data to new tables
4. Drop old tables and rename new ones
5. Preserve all data and relationships

## For New Installations

If you're starting fresh, simply run the application. The schema will be created automatically with the correct field names.

## Verification

After migration, you can verify the schema by running:

```bash
sqlite3 data/vocab.db ".schema"
```

Or test the endpoints:

```bash
bash tests/db_endpoints_test.bash
```
