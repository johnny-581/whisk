# Quick Start - Apify Integration

## 🚀 Installation (3 steps)

### 1. Install the Apify client

```bash
cd backend
pip install apify-client
```

### 2. Get your Apify API token

Visit: https://console.apify.com/account/integrations

### 3. Add token to `.env`

```bash
# Edit backend/.env and add:
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ Test It

### Demo with sample data (no API call)

```bash
python tests/demo_format_transcript.py
```

**Expected output:**

```
[00:03] みなさん、こんにちは
[00:05] ここは、スーパーです
[00:09] 買い物の前に、牛乳パックなどリサイクルの物を出します
...
```

### Full test with real API call

```bash
python tests/test_apify_transcript.py
```

This will:

- Fetch a real YouTube transcript in Japanese
- Fetch the same video in English
- Show both raw and formatted outputs

## 📝 Usage in Code

```python
from app.services.youtube import get_video_transcript, format_transcript

# Japanese (default)
data = get_video_transcript("https://www.youtube.com/watch?v=IELMSD2kdmk")
transcript = format_transcript(data)

# English
data = get_video_transcript("https://www.youtube.com/watch?v=IELMSD2kdmk", "en")
transcript = format_transcript(data)
```

## 🔧 API Endpoint

The video analysis endpoint now uses Japanese transcripts:

```bash
curl -X POST http://localhost:8000/video-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=IELMSD2kdmk",
    "user_level": "intermediate"
  }'
```

## 📚 More Info

See `APIFY_INTEGRATION.md` for complete documentation.
