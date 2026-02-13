/**
 * Select a question based on difficulty and exclusion rules
 * @param {Array} questions - Array of all questions
 * @param {number} difficulty - Target difficulty level (1-5)
 * @param {Array<number>} playerUsedIds - IDs of questions already answered by current player
 * @param {Array<number>} otherPlayersOnCellIds - IDs of questions answered by other players on same cell
 * @returns {Object|null} Selected question or null if none available
 */
export function selectQuestion(questions, difficulty, playerUsedIds, otherPlayersOnCellIds = []) {
  const excludedIds = new Set([...playerUsedIds, ...otherPlayersOnCellIds]);
  
  let available = questions.filter(q => 
    q.difficulty === difficulty && !excludedIds.has(q.id)
  );
  
  // Fallback: try adjacent difficulties bidirectionally
  if (available.length === 0) {
    const fallbackOrder = [difficulty - 1, difficulty + 1, difficulty - 2, difficulty + 2];
    for (const fallbackDiff of fallbackOrder) {
      if (fallbackDiff >= 1 && fallbackDiff <= 5) {
        available = questions.filter(q => 
          q.difficulty === fallbackDiff && !excludedIds.has(q.id)
        );
        if (available.length > 0) break;
      }
    }
  }
  
  if (available.length === 0) {
    console.warn('No questions available for difficulty', difficulty);
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get IDs of questions answered by other players on same cell
 * @param {Array} players - All players in the game
 * @param {number} currentPlayerId - ID of current player
 * @param {number} currentPosition - Current cell position
 * @returns {Array<number>} IDs of questions answered by other players on this cell
 */
export function getOtherPlayersQuestions(players, currentPlayerId, currentPosition) {
  return players
    .filter(p => p.id !== currentPlayerId && p.position === currentPosition)
    .flatMap(p => p.answeredQuestions);
}
