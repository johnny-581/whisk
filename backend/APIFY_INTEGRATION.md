# Apify YouTube Transcript Integration

This document describes the integration of Apify's YouTube Transcript Scraper into the project.

## Overview

We've replaced the `youtube-transcript-api` library with Apify's YouTube Transcript Scraper actor to fetch video transcripts. The default language is now **Japanese (ja)**, but it supports any language code.

## Changes Made

### 1. Dependencies (`pyproject.toml`)

- **Added**: `apify-client>=1.7.0`
- **Removed**: `youtube-transcript-api>=1.2.4`

### 2. Configuration (`app/core/config.py`)

- **Added**: `APIFY_API_TOKEN` environment variable
- **Added**: Validation for `APIFY_API_TOKEN`
- **Removed**: `PROXY_URL` (no longer needed)

### 3. YouTube Service (`app/services/youtube.py`)

Completely rewritten to use Apify:

- `get_video_transcript(video_url, target_language="ja")`: Fetches transcript from Apify
- `format_transcript(transcript_data)`: Formats Apify's JSON response into readable text with timestamps
- `extract_video_id(url)`: Unchanged utility function

### 4. Video Analysis Endpoint (`app/api/endpoints/video_analysis.py`)

- Updated to use new `get_video_transcript()` and `format_transcript()` functions
- Default language is Japanese (`target_language="ja"`)

### 5. Environment Files

- **`.env.example`**: Added `APIFY_API_TOKEN` placeholder
- **`.env`**: Added `APIFY_API_TOKEN` placeholder (you need to fill this in)

## Apify Response Format

The Apify actor returns JSON in this structure:

```json
[
  {
    "data": [
      {
        "start": "3.336",
        "dur": "2.169",
        "text": "みなさん、こんにちは"
      },
      {
        "start": "5.505",
        "dur": "3.837",
        "text": "ここは、スーパーです"
      }
    ]
  }
]
```

### Formatted Output

The `format_transcript()` function converts this to:

```
[00:03] みなさん、こんにちは
[00:05] ここは、スーパーです
[00:09] 買い物の前に、牛乳パックなどリサイクルの物を出します
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install apify-client
```

Or install all dependencies:

```bash
pip install -e .
```

### 2. Get Your Apify API Token

1. Go to [Apify Console](https://console.apify.com/account/integrations)
2. Sign up or log in
3. Navigate to **Settings** → **Integrations**
4. Copy your API token

### 3. Update `.env` File

Edit `backend/.env` and add your token:

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Test the Integration

Run the test script:

```bash
python tests/test_apify_transcript.py
```

This will:

- Fetch a transcript in Japanese (default)
- Fetch a transcript in English
- Display both raw and formatted outputs
- Verify the integration works correctly

## Usage Examples

### Basic Usage (Japanese)

```python
from app.services.youtube import get_video_transcript, format_transcript

# Fetch Japanese transcript (default)
video_url = "https://www.youtube.com/watch?v=IELMSD2kdmk"
transcript_data = get_video_transcript(video_url)
formatted = format_transcript(transcript_data)
print(formatted)
```

### Fetch English Transcript

```python
# Fetch English transcript
transcript_data = get_video_transcript(video_url, target_language="en")
formatted = format_transcript(transcript_data)
print(formatted)
```

### Other Languages

```python
# Spanish
transcript_data = get_video_transcript(video_url, target_language="es")

# French
transcript_data = get_video_transcript(video_url, target_language="fr")

# German
transcript_data = get_video_transcript(video_url, target_language="de")
```

## API Endpoint

The `/video-analysis` endpoint now uses Japanese transcripts by default:

```bash
curl -X POST http://localhost:8000/video-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=IELMSD2kdmk",
    "user_level": "intermediate"
  }'
```

## Troubleshooting

### Error: "Missing required environment variables: APIFY_API_TOKEN"

**Solution**: Make sure you've added your Apify API token to the `.env` file.

### Error: "No transcript data returned from Apify"

**Possible causes**:

1. The video doesn't have transcripts available
2. The specified language isn't available for that video
3. Invalid video URL
4. Apify API token is invalid or expired

### Import Error: "apify_client could not be resolved"

**Solution**: Install the package:

```bash
pip install apify-client
```

## Cost Considerations

Apify charges based on usage. Check their [pricing page](https://apify.com/pricing) for details. The YouTube Transcript Scraper actor typically uses:

- ~0.01 compute units per video transcript
- Free tier includes some compute units per month

## Migration Notes

### What Changed

- **No more proxy configuration needed**: Apify handles all the infrastructure
- **Language parameter**: Now uses `target_language` instead of language codes
- **Response format**: Different JSON structure (see above)
- **Async support**: The Apify client supports async operations if needed in the future

### What Stayed the Same

- `extract_video_id()` function works exactly the same
- The formatted output has the same `[MM:SS] text` format
- The API endpoint interface is unchanged

## Future Improvements

Potential enhancements:

1. Add caching to avoid re-fetching the same transcripts
2. Support for multiple language transcripts in a single request
3. Add retry logic for failed requests
4. Implement async/await for better performance
5. Add transcript download/export functionality
