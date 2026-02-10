curl -X POST "https://whisk-production.up.railway.app/video_analysis" \
     -H "Content-Type: application/json" \
     -d '{
           "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
           "user_level": 5
         }'