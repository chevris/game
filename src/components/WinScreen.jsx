import { useGameStore } from '../store/gameStore';
import './WinScreen.css';

export function WinScreen() {
  const winner = useGameStore(state => state.winner);
  const players = useGameStore(state => state.players);
  const resetGame = useGameStore(state => state.resetGame);
  
  const winningPlayer = players.find(p => p.id === winner);
  
  if (!winningPlayer) {
    return null;
  }
  
  return (
    <div className="win-screen">
      <div className="win-content">
        <h1>🎉 Congratulations! 🎉</h1>
        <div 
          className="winner-token"
          style={{ backgroundColor: winningPlayer.color }}
        >
          {winningPlayer.id}
        </div>
        <h2>Player {winningPlayer.id} Wins!</h2>
        <div className="stats">
          <p>Correct Answers: {winningPlayer.correctCount}</p>
          <p>Incorrect Answers: {winningPlayer.incorrectCount}</p>
          <p>Accuracy: {Math.round((winningPlayer.correctCount / (winningPlayer.correctCount + winningPlayer.incorrectCount)) * 100)}%</p>
        </div>
        <button className="restart-button" onClick={resetGame}>
          Play Again
        </button>
      </div>
    </div>
  );
}
