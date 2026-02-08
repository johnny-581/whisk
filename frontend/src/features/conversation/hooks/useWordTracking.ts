import { useCallback, useEffect, useState } from "react";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import type {
  VocabWord,
  ServerMessage,
  UserTranscriptData,
  Word,
} from "../types";
import { isWordMatch } from "../utils/wordMatching";

interface UseWordTrackingParams {
  initialWords: VocabWord[];
}

interface UseWordTrackingReturn {
  words: Word[];
  allCompleted: boolean;
}

/**
 * Hook to track word completion state and handle transcript matching
 */
export const useWordTracking = ({
  initialWords,
}: UseWordTrackingParams): UseWordTrackingReturn => {
  const [words, setWords] = useState<Word[]>(() =>
    initialWords.map((w) => ({ ...w, active: true }))
  );

  // Update words when initialWords change
  useEffect(() => {
    setWords(initialWords.map((w) => ({ ...w, active: true })));
  }, [initialWords]);

  // Handle server messages for word detection
  const handleMessage = useCallback((message: ServerMessage) => {
    if (message.type === "word_detected" && message.payload) {
      const detectedWord = message.payload;
      setWords((prev: Word[]) =>
        prev.map((w) =>
          w.word.toLowerCase() === detectedWord.toLowerCase()
            ? { ...w, active: false }
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
        if (!entry.active) return entry;

        const target = entry.word.trim();
        if (!target) return entry;

        const matched = isWordMatch(transcript, target);
        return matched ? { ...entry, active: false } : entry;
      })
    );
  }, []);

  // Subscribe to RTVI events
  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);

  const allCompleted = words.length > 0 && words.every((w) => !w.active);

  return { words, allCompleted };
};
