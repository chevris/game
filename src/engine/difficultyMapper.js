/**
 * Map player position to difficulty level (1-3), matching tile color levels.
 * Level 1 (yellow):  0–50%  of spiral path
 * Level 2 (peach):   50–85% of spiral path
 * Level 3 (coral):   85–100% of spiral path
 * @param {number} position - Current position index
 * @param {number} totalCells - Total cells in spiral path
 * @returns {number} Difficulty level (1-3)
 */
export function getDifficulty(position, totalCells) {
  const progress = position / totalCells;

  if (progress < 0.50) return 1;  // 0-50%  → yellow tiles
  if (progress < 0.85) return 2;  // 50-85% → peach tiles
  return 3;                       // 85-100% → coral tiles
}
