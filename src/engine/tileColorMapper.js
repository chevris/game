/**
 * Map a tile's spiral-path position to a visual difficulty color level (1–3).
 * This is independent from the question-difficulty mapper (which uses 5 levels).
 *
 * Distribution for a 121-tile board (11×11):
 *   Level 1 (light yellow):  positions 0–60  (~50% of tiles)
 *   Level 2 (peach/salmon):  positions 61–102 (~35% of tiles)
 *   Level 3 (coral/rose):    positions 103–120 (~15% — never exceeds 20%)
 *
 * @param {number} position   - Tile index in the spiral path (0-based)
 * @param {number} totalCells - Total number of tiles on the board
 * @returns {1|2|3} Visual color level
 */
export function getTileColorLevel(position, totalCells) {
  const progress = position / totalCells;
  if (progress < 0.50) return 1;
  if (progress < 0.85) return 2;
  return 3;
}
