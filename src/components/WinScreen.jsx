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
        <h1>🎉 Glückwunsch! 🎉</h1>
        <div 
          className="winner-token"
          style={{ backgroundColor: winningPlayer.color }}
        >
          {winningPlayer.id}
        </div>
        <h2>{winningPlayer.name || `Spielerin ${winningPlayer.id}`} hat gewonnen!</h2>
        <div className="stats">
          <p>Richtige Antworten: {winningPlayer.correctCount}</p>
          <p>Falsche Antworten: {winningPlayer.incorrectCount}</p>
          <p>Genauigkeit: {Math.round((winningPlayer.correctCount / (winningPlayer.correctCount + winningPlayer.incorrectCount)) * 100)}%</p>
        </div>
        <button className="restart-button" onClick={resetGame}>
          Nochmal spielen
        </button>
      </div>
    </div>
  );
}
