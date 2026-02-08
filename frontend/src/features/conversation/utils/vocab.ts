import type { VocabWord } from "../types";
import { DEFAULT_USER_LEVEL, VALID_JLPT_LEVELS } from "../constants";

/**
 * Picks a random subset of items within a specified range
 */
export const pickRandomRange = <T>(
  items: T[],
  minCount: number,
  maxCount: number
): T[] => {
  if (!items.length) return [];

  const upper = Math.min(maxCount, items.length);
  if (upper <= minCount) {
    return items.slice(0, upper);
  }

  const count =
    minCount + Math.floor(Math.random() * Math.max(1, upper - minCount + 1));

  // Fisher-Yates shuffle
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count);
};

/**
 * Normalizes JLPT level to valid format (N1-N5)
 */
export const normalizeLevel = (level: string): string => {
  const upper = (level || "").toUpperCase();
  return VALID_JLPT_LEVELS.includes(upper as "N1" | "N2" | "N3" | "N4" | "N5")
    ? upper
    : DEFAULT_USER_LEVEL;
};

/**
 * Normalizes various word entry formats into VocabWord structure
 */
export const normalizeWord = (
  entry: unknown,
  level: string,
  index: number
): VocabWord | null => {
  // Handle string format
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed
      ? {
          id: `word-${index}-${trimmed}`,
          word: trimmed,
          difficulty: level,
        }
      : null;
  }

  // Handle object format
  if (typeof entry === "object" && entry) {
    const obj = entry as Record<string, unknown>;
    const word = typeof obj.word === "string" ? obj.word.trim() : "";

    if (!word) return null;

    const difficulty =
      typeof obj.difficulty === "string"
        ? normalizeLevel(obj.difficulty)
        : level;

    return {
      id: typeof obj.id === "string" ? obj.id : `word-${index}-${word}`,
      word,
      difficulty,
      start_time:
        typeof obj.start_time === "string" ? obj.start_time : undefined,
    };
  }

  return null;
};
