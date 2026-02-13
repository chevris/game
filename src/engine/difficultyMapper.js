/**
 * Map player position to difficulty level (1-5)
 * @param {number} position - Current position index
 * @param {number} totalCells - Total cells in spiral path
 * @returns {number} Difficulty level (1-5)
 */
export function getDifficulty(position, totalCells) {
  const progress = position / totalCells;
  
  if (progress < 0.17) return 1;      // 0-17% (outer ring)
  if (progress < 0.41) return 2;      // 18-41%
  if (progress < 0.66) return 3;      // 42-66%
  if (progress < 0.83) return 4;      // 67-83%
  return 5;                           // 84-100% (approaching center)
}
