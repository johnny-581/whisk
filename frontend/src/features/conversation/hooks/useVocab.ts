import { useEffect, useState } from "react";
import type { Vocab } from "../types";
import { pickRandomRange } from "../utils/vocab";

interface UseVocabParams {
  videoId: string;
}

interface UseVocabReturn {
  vocabs: Vocab[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage vocabulary data for a video
 * Returns 5 randomly selected vocabs from the video
 */
export const useVocab = ({ videoId }: UseVocabParams): UseVocabReturn => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadVocab = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/videos/${videoId}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const vocab = Array.isArray(data?.vocab) ? data.vocab : [];

        // Transform API response to match Vocab type
        const transformedWords: Vocab[] = vocab.map((entry: Vocab) => ({
          id: entry.id || "",
          japanese_vocab: entry.japanese_vocab || "",
          pronunciation: entry.pronunciation || "",
          english_translation: entry.english_translation || "",
          timestamp: entry.timestamp || "",
          jlpt_level: entry.jlpt_level || 5,
          checked: false, // Initialize as unchecked
        }));

        // Randomly select 5 vocabs
        const randomVocabs = pickRandomRange(transformedWords);

        if (isMounted) {
          setVocabs(randomVocabs);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load vocab list.");
          setVocabs([]);
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
  }, [videoId]);

  return { vocabs, isLoading, error };
};
