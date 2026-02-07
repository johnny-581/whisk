#!/bin/bash

# run with: bash backend/tests/db_endpoints_test.bash

# Base URL for the API
BASE_URL="http://localhost:8000"

echo "--- 1. Testing POST /videos (Create/Update Video) ---"
curl -X POST "$BASE_URL/videos" \
     -H "Content-Type: application/json" \
     -d '{
  "video_id": "dQw4w9WgXcQ",
  "title": "Never Gonna Give You Up",
  "tags": ["music", "classic", "80s"],
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "duration": "3:32",
  "summary": "A classic pop song by Rick Astley.",
  "vocab": [
    {
      "japanese_vocab": "歌",
      "pronunciation": "うた",
      "english_translation": "song",
      "timestamp": "0:10",
      "jlpt_level": 5
    },
    {
      "japanese_vocab": "決して",
      "pronunciation": "けっして",
      "english_translation": "never",
      "timestamp": "0:43",
      "jlpt_level": 3
    }
  ]
}'
echo -e "\n"

echo "--- 2. Testing GET /videos (List All Videos) ---"
curl -X GET "$BASE_URL/videos" \
     -H "Accept: application/json"
echo -e "\n"

echo "--- 3. Testing GET /videos/{video_id} (Get Full Details) ---"
curl -X GET "$BASE_URL/videos/dQw4w9WgXcQ" \
     -H "Accept: application/json"
echo -e "\n"

echo "--- 4. Testing DELETE /videos/{video_id} (Delete Video) ---"
curl -X DELETE "$BASE_URL/videos/dQw4w9WgXcQ"
echo -e "\n"

echo "--- 5. Verifying Deletion (Should return 404) ---"
curl -X GET "$BASE_URL/videos/dQw4w9WgXcQ" \
     -H "Accept: application/json"
echo -e "\n"
