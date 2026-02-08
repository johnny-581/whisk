/**
 * Utilities for matching user transcripts against target vocabulary words
 */

/**
 * Normalizes text for matching by removing punctuation and whitespace
 */
export const normalizeForMatch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "")
    .trim();

/**
 * Normalizes romaji text by removing non-alphabetic characters
 */
export const normalizeRomaji = (value: string): string =>
  value.toLowerCase().replace(/[^a-z]/g, "");

/**
 * Simple romanization map for common Japanese words
 * In production, consider using a proper romanization library
 */
const ROMANIZATION_MAP: Record<string, string> = {
  りんご: "ringo",
  あい: "ai",
  ねこ: "neko",
  いぬ: "inu",
  みず: "mizu",
  やま: "yama",
  ともだち: "tomodachi",
  ほん: "hon",
};

/**
 * Converts Japanese word to romaji if available
 */
export const romanize = (word: string): string => {
  return ROMANIZATION_MAP[word] ?? "";
};

/**
 * Variant spellings and representations for Japanese words
 * Includes hiragana, katakana, kanji, and romaji variants
 */
const WORD_VARIANTS_MAP: Record<string, string[]> = {
  りんご: ["りんご", "リンゴ", "林檎", "り ん ご", "ringo", "lingo"],
  あい: ["あい", "アイ", "愛", "ai"],
  ねこ: ["ねこ", "ネコ", "猫", "neko"],
  いぬ: ["いぬ", "イヌ", "犬", "inu"],
  みず: ["みず", "ミズ", "水", "mizu"],
  やま: ["やま", "ヤマ", "山", "yama"],
  ともだち: ["ともだち", "トモダチ", "友達", "tomodachi"],
  ほん: ["ほん", "ホン", "本", "hon"],
};

/**
 * Gets all valid variants for a word
 */
export const variantsForWord = (word: string): string[] => {
  return WORD_VARIANTS_MAP[word] ?? [word];
};

/**
 * Checks if transcript matches the target word using various matching strategies
 */
export const isWordMatch = (
  transcript: string,
  targetWord: string
): boolean => {
  if (!transcript || !targetWord) return false;

  const normalizedTranscript = normalizeForMatch(transcript);
  const normalizedTarget = normalizeForMatch(targetWord);

  // Direct match
  if (normalizedTranscript.includes(normalizedTarget)) return true;
  if (transcript.includes(targetWord)) return true;

  // Romaji matching
  const romaji = romanize(targetWord);
  const normalizedRomaji = normalizeRomaji(romaji);
  const normalizedTranscriptRomaji = normalizeRomaji(transcript).replace(
    /l/g,
    "r"
  );

  if (
    normalizedRomaji &&
    (normalizedTranscriptRomaji.includes(normalizedRomaji) ||
      normalizedTranscriptRomaji.includes(normalizedRomaji.replace(/r/g, "l")))
  ) {
    return true;
  }

  // Variant matching
  const variants = variantsForWord(targetWord);
  const variantMatch = variants.some((variant) => {
    const normalizedVariant = normalizeForMatch(variant);
    if (normalizedTranscript.includes(normalizedVariant)) return true;

    const variantRomaji = normalizeRomaji(variant).replace(/l/g, "r");
    return variantRomaji && normalizedTranscriptRomaji.includes(variantRomaji);
  });

  return variantMatch;
};
