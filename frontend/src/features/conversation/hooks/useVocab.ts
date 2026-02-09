import { useEffect, useState, useMemo } from "react";
import type { Vocab } from "../types";
import { pickRandomRange } from "../utils/vocab";

interface UseVocabParams {
  videoId: string;
}

interface UseVocabReturn {
  vocabs: Vocab[];
  summary: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage vocabulary data for a video
 * Returns 5 randomly selected vocabs from the video
 */
export const useVocab = ({ videoId }: UseVocabParams): UseVocabReturn => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [summary, setSummary] = useState<string>("");
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
        const videoSummary = data?.summary || "";

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
          setSummary(videoSummary);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load vocab list.");
          setVocabs([]);
          setSummary("");
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

  // return { vocabs, summary, isLoading, error };

  return useMemo(
    () => ({
      vocabs: [
        {
          id: "1",
          japanese_vocab: "Apple",
          pronunciation: "ringo",
          english_translation: "Apple",
          timestamp: "0:45",
          jlpt_level: 5,
          checked: false,
        },
        {
          id: "2",
          japanese_vocab: "Supermarket",
          pronunciation: "gakusei",
          english_translation: "Student",
          timestamp: "1:12",
          jlpt_level: 5,
          checked: false,
        },
        {
          id: "3",
          japanese_vocab: "Christmas",
          pronunciation: "chrisutamasu",
          english_translation: "Christmas",
          timestamp: "1:15",
          jlpt_level: 5,
          checked: false,
        },
      ],
      summary:
        "This video provides a tour of a typical Japanese supermarket while discussing how Christmas is celebrated in Japan as a commercial and romantic event. The narrator explains seasonal shopping habits, demonstrates how to use a self-checkout machine, and shares a recipe for making KFC-style fried chicken at home.",
      isLoading: false,
      error: null,
    }),
    [] // Empty dependency array since this is static mock data
  );
};
