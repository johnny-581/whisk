import { useCallback, useEffect, useState } from "react";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import type { Vocab, ServerMessage, UserTranscriptData } from "../types";
import { isWordMatch } from "../utils/wordMatching";

interface UseWordTrackingParams {
  initialWords: Vocab[];
}

interface UseWordTrackingReturn {
  words: Vocab[];
  allCompleted: boolean;
}

/**
 * Hook to track word completion state and handle transcript matching
 */
export const useWordTracking = ({
  initialWords,
}: UseWordTrackingParams): UseWordTrackingReturn => {
  const [words, setWords] = useState<Vocab[]>(initialWords);

  // Update words when initialWords change
  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  // Handle server messages for word detection
  const handleMessage = useCallback((message: ServerMessage) => {
    if (message.type === "word_detected" && message.payload) {
      const detectedWord = message.payload;
      setWords((prev: Vocab[]) =>
        prev.map((w) =>
          w.japanese_vocab.toLowerCase() === detectedWord.toLowerCase()
            ? { ...w, checked: true }
            : w
        )
      );
    }
  }, []);

  // Handle user transcripts for word matching
  const handleUserTranscript = useCallback((data: UserTranscriptData) => {
    const isFinal = data.final ?? true;
    if (!isFinal || !data.text) return;

    const transcript = data.text.trim();
    if (!transcript) return;

    if (process.env.NODE_ENV !== "production") {
      console.debug("[UserTranscript]", transcript);
    }

    setWords((prev) =>
      prev.map((entry) => {
        if (entry.checked) return entry;

        const target = entry.japanese_vocab.trim();
        if (!target) return entry;

        const matched = isWordMatch(transcript, target);
        return matched ? { ...entry, checked: true } : entry;
      })
    );
  }, []);

  // Subscribe to RTVI events
  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);

  const allCompleted = words.length > 0 && words.every((w) => w.checked);

  return { words, allCompleted };
};
