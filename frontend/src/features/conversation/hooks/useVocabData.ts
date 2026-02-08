import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import type { VocabWord } from "../types";
import { normalizeWord, pickRandomRange, normalizeLevel } from "../utils/vocab";
import {
  FALLBACK_WORDS,
  MIN_VOCAB,
  MAX_VOCAB,
  DEFAULT_USER_LEVEL,
} from "../constants";

interface UseVocabDataParams {
  videoId: string;
}

interface UseVocabDataReturn {
  words: VocabWord[];
  isLoading: boolean;
  error: string | null;
  userLevel: string;
}

/**
 * Hook to fetch and manage vocabulary data for a video
 * Also manages user's JLPT level from store or localStorage
 */
export const useVocabData = ({
  videoId,
}: UseVocabDataParams): UseVocabDataReturn => {
  const [userLevel, setUserLevel] = useState<string>(DEFAULT_USER_LEVEL);
  const jlptLevel = useUserStore((state) => state.jlptLevel);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user level from store or localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Priority: store > localStorage
    if (jlptLevel && Number.isFinite(jlptLevel)) {
      setUserLevel(normalizeLevel(`N${jlptLevel}`));
      return;
    }

    const storedLevel = window.localStorage.getItem("userLevel");
    if (storedLevel) {
      setUserLevel(normalizeLevel(storedLevel));
    }
  }, [jlptLevel]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadVocab = async () => {
      setIsLoading(true);
      setError(null);

      const level = normalizeLevel(userLevel);
      const vocabEndpoint = `/api/videos/${videoId}/vocab`;

      try {
        const res = await fetch(`${vocabEndpoint}?level=${level}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const vocab = Array.isArray(data?.vocab) ? data.vocab : [];

        const normalized: VocabWord[] = vocab
          .map((entry: unknown, idx: number) =>
            normalizeWord(entry, level, idx)
          )
          .filter((entry: VocabWord | null): entry is VocabWord =>
            Boolean(entry)
          );

        const fallbackWords: VocabWord[] = FALLBACK_WORDS.map(
          (word: string, idx: number) => ({
            id: `fallback-${idx}-${word}`,
            word,
            difficulty: level,
          })
        );

        const picked: VocabWord[] =
          normalized.length > 0
            ? pickRandomRange<VocabWord>(normalized, MIN_VOCAB, MAX_VOCAB)
            : pickRandomRange<VocabWord>(fallbackWords, MIN_VOCAB, MAX_VOCAB);

        if (isMounted) {
          setWords(picked);
        }
      } catch (err) {
        const fallbackWords: VocabWord[] = FALLBACK_WORDS.map(
          (word: string, idx: number) => ({
            id: `fallback-${idx}-${word}`,
            word,
            difficulty: level,
          })
        );

        if (isMounted) {
          setError("Failed to load vocab list.");
          setWords(
            pickRandomRange<VocabWord>(fallbackWords, MIN_VOCAB, MAX_VOCAB)
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVocab();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [videoId, userLevel]);

  return { words, isLoading, error, userLevel };
};
