# Database Schema Update Summary

## Overview

Updated the database schema to accurately reflect the field names defined in `app/schemas/video.py`, ensuring consistency between the Pydantic models and the SQLite database schema.

## Schema Changes

### 1. `vocabs` Table

| Old Field Name | New Field Name        | Type    | Description                         |
| -------------- | --------------------- | ------- | ----------------------------------- |
| `word`         | `japanese_vocab`      | TEXT    | The Japanese vocabulary word/phrase |
| `definition`   | `english_translation` | TEXT    | English translation of the vocab    |
| `difficulty`   | `jlpt_level`          | INTEGER | JLPT level (1-5 for N1-N5)          |

### 2. `video_vocab` Table

| Old Field Name | New Field Name | Type | Description                           |
| -------------- | -------------- | ---- | ------------------------------------- |
| `start_time`   | `timestamp`    | TEXT | When the vocab appears (mm:ss format) |

## Files Modified

### 1. `backend/app/db/__init__.py`

- Updated `init_schema()` function to use new field names in CREATE TABLE statements
- Changed: `word` → `japanese_vocab`, `definition` → `english_translation`, `difficulty` → `jlpt_level`, `start_time` → `timestamp`

### 2. `backend/app/db/repositories.py`

- **`ensure_vocab()` function:**
  - Parameters: `word` → `japanese_vocab`, `definition` → `english_translation`, `difficulty` → `jlpt_level`
  - SQL queries updated to use new field names
- **`link_video_vocab()` function:**
  - Parameter: `start_time` → `timestamp`
  - SQL query updated to use new field name

### 3. `backend/app/api/endpoints/videos.py`

- **`get_video()` endpoint:**
  - Updated SELECT query to use new field names: `v.japanese_vocab`, `v.english_translation`, `v.jlpt_level`, `vv.timestamp`
  - Updated ORDER BY clause to use `vv.timestamp`
- **`create_video()` endpoint:**
  - Updated `ensure_vocab()` call to use new parameter names
  - Updated `link_video_vocab()` call to use `timestamp` instead of `start_time`

## Files Created

### 1. `backend/migrate_schema.py`

Migration script that:

- Checks if migration is needed
- Creates new tables with updated schema
- Copies all existing data
- Drops old tables and renames new ones
- Preserves all data integrity and foreign key relationships

### 2. `backend/MIGRATION_README.md`

Documentation for the migration process with instructions for both existing installations and new setups.

## Migration Results

- ✅ Migration completed successfully
- ✅ Schema verified with correct field names
- ✅ Existing data preserved (2 vocab entries migrated)
- ✅ All foreign key relationships maintained

## Testing

The existing test file `backend/tests/db_endpoints_test.bash` already uses the correct field names and requires no changes.

## Backward Compatibility

⚠️ **Breaking Change**: This is a breaking change for any code that directly queries the database using the old field names. All application code has been updated to use the new field names.

## Next Steps

- Run the test suite to verify all endpoints work correctly
- Update any external scripts or tools that may directly query the database
- Consider adding database version tracking for future migrations
