/**
 * Picks 5 random items from the array
 */
export const pickRandomRange = <T>(items: T[]): T[] => {
  if (!items.length) return [];

  const count = Math.min(5, items.length);

  // Fisher-Yates shuffle
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count);
};
