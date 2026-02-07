def get_vocab_chatbot_prompt(target_words: list[str]) -> list[dict]:
    """Build initial LLM context with the game host system prompt."""
    return [
        {
            "role": "system",
            "content": (
                "You are a language learning chatbot. "
                "Your goal is to help the user learn by talking to them and getting the them to say specific words. "
                f"The words are: {', '.join(target_words)}. "
                "When you hear a secret word used in a complete sentence, call the 'mark_word' tool immediately. "
                "The user must incorperate the word in a complete sentence. If the user just says the word on its own, do call the call the 'mark_word' tool"
                "Do not tell the user the words directly. Do not name the words directly."
                "Steer the topic so that the user are more likely to say the words."
                "Start by introducing yourself and the game."
            ),
        },
    ]


def get_video_analysis_prompt(transcript: str, user_level: int) -> str:
    """Build the prompt for video analysis and vocabulary extraction."""
    return f"""
            Your job is to extract exactly 20 Japanese vocabularies from the provided YouTube video transcript.

            In your response, provide:
            - video_id: The YouTube video ID
            - video_url: The full video URL
            - title: The video title
            - duration: The video duration in mm:ss format
            - tags: A list of relevant tags for the video content
            - summary: A concise summary of the video content (2-3 sentences)
            - vocab: A list of exactly 20 vocabulary items

            For each vocabulary item, extract:
            - japanese_vocab: The Japanese word or phrase in its original form
            - pronunciation: The hiragana/katakana reading of the word
            - english_translation: The English meaning
            - timestamp: When the word is spoken in mm:ss format
            - jlpt_level: The JLPT level (1-5 for N1-N5)

            From the transcript, extract vocabularies that correspond to Japanese words at approximately JLPT N{user_level} level:
            - Prioritize common, concrete nouns (objects, people, places, concepts)
            - Prioritize high-frequency verbs (actions and states)
            - Include adjectives and useful expressions
            - Ensure the timestamp accurately reflects when each word appears in the transcript

            Transcript:
            {transcript}
        """
