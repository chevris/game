/**
 * Check if player has reached center (win condition)
 * @param {number} position - Current position index
 * @param {number} centerIndex - Index of center cell
 * @returns {boolean} True if player has won
 */
export function checkWin(position, centerIndex) {
  return position >= centerIndex;
}
