def get_system_messages(target_words: list[str]) -> list[dict]:
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
