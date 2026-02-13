/**
 * Calculate new position after dice roll
 * @param {number} currentIndex - Current position in spiral path
 * @param {number} diceRoll - Dice result (1-6)
 * @param {number} centerIndex - Index of center cell
 * @returns {number} New position (clamped to center)
 */
export function movePlayer(currentIndex, diceRoll, centerIndex) {
  const newIndex = currentIndex + diceRoll;
  return Math.min(newIndex, centerIndex);
}
