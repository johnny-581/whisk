curl -X POST http://localhost:8000/vocab-extract \
     -H "Content-Type: application/json" \
     -d '{
           "video_url": "https://www.youtube.com/watch?v=C3oPjuudXas&t=1s",
           "user_level": 3
         }'