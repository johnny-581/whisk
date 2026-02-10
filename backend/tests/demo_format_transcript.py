#!/usr/bin/env python3
"""
Demo script showing how the Apify transcript data is formatted.
Uses the sample data you provided to demonstrate the output format.
"""

import json
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.youtube import format_transcript


# Sample data from Apify (first few segments from your example)
sample_apify_response = {
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
        },
        {
            "start": "9.342",
            "dur": "13.764",
            "text": "買い物の前に、牛乳パックなどリサイクルの物を出します"
        },
        {
            "start": "23.982",
            "dur": "4.129",
            "text": "今日は、スーパーで買い物をしながら"
        },
        {
            "start": "28.111",
            "dur": "7.090",
            "text": "日本のクリスマスについてお話しします"
        },
        {
            "start": "67.317",
            "dur": "7.340",
            "text": "もやしは安い野菜です"
        },
        {
            "start": "125.583",
            "dur": "3.629",
            "text": "キムチも買います"
        },
        {
            "start": "130.713",
            "dur": "3.838",
            "text": "納豆も買います"
        }
    ]
}


def main():
    print("=" * 80)
    print("Apify Transcript Formatting Demo")
    print("=" * 80)
    
    print("\n📦 Input (Apify JSON Response):")
    print("-" * 80)
    print(json.dumps(sample_apify_response, indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 80)
    print("📝 Output (Formatted Transcript):")
    print("=" * 80)
    
    formatted = format_transcript(sample_apify_response)
    print(formatted)
    
    print("\n" + "=" * 80)
    print("✅ Formatting Complete!")
    print("=" * 80)
    
    print("\nFormat explanation:")
    print("- Timestamps are converted from seconds to [MM:SS] format")
    print("- Each line contains: [timestamp] text")
    print("- Original Japanese text is preserved")
    print("- Duration ('dur') is not included in output (only start time)")


if __name__ == "__main__":
    main()
