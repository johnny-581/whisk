#!/usr/bin/env python3
"""Test script for Apify YouTube transcript scraper."""

import sys
import json
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.youtube import get_video_transcript, format_transcript


def test_apify_transcript():
    """Test fetching and formatting transcript from Apify."""
    
    # Test video URL
    video_url = "https://www.youtube.com/watch?v=IELMSD2kdmk"
    
    print(f"Fetching Japanese transcript for: {video_url}")
    print("-" * 80)
    
    try:
        # Fetch transcript in Japanese (default)
        print("\n🇯🇵 Fetching Japanese transcript...")
        transcript_data_ja = get_video_transcript(video_url, target_language="ja")
        
        print("\n📦 Raw Transcript Data (Japanese):")
        # Only show first 3 segments to keep output manageable
        sample_data = transcript_data_ja.copy()
        if "data" in sample_data and len(sample_data["data"]) > 3:
            sample_data["data"] = sample_data["data"][:3]
            print(json.dumps(sample_data, indent=2, ensure_ascii=False))
            print(f"... (showing first 3 of {len(transcript_data_ja['data'])} segments)")
        else:
            print(json.dumps(sample_data, indent=2, ensure_ascii=False))
        print("-" * 80)
        
        # Format transcript
        formatted_ja = format_transcript(transcript_data_ja)
        
        print("\n📝 Formatted Transcript (Japanese) - First 10 lines:")
        lines = formatted_ja.split("\n")
        print("\n".join(lines[:10]))
        if len(lines) > 10:
            print(f"... (showing first 10 of {len(lines)} lines)")
        print("-" * 80)
        
        # Test English transcript too
        print("\n🇺🇸 Fetching English transcript...")
        transcript_data_en = get_video_transcript(video_url, target_language="en")
        formatted_en = format_transcript(transcript_data_en)
        
        print("\n📝 Formatted Transcript (English) - First 10 lines:")
        lines_en = formatted_en.split("\n")
        print("\n".join(lines_en[:10]))
        if len(lines_en) > 10:
            print(f"... (showing first 10 of {len(lines_en)} lines)")
        print("-" * 80)
        
        print("\n✅ Test completed successfully!")
        print(f"Japanese transcript: {len(formatted_ja.split())} segments")
        print(f"English transcript: {len(formatted_en.split())} segments")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    test_apify_transcript()
