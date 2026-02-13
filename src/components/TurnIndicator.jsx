import { useGameStore } from '../store/gameStore';
import './TurnIndicator.css';

export function TurnIndicator() {
  const players = useGameStore(state => state.players);
  const currentTurnIndex = useGameStore(state => state.currentTurnIndex);
  
  const currentPlayer = players[currentTurnIndex];
  
  if (!currentPlayer) {
    return null;
  }
  
  return (
    <div className="turn-indicator">
      <h2>Current Turn</h2>
      <div className="current-player">
        <div 
          className="player-token-large"
          style={{ backgroundColor: currentPlayer.color }}
        >
          {currentPlayer.id}
        </div>
        <h3>Player {currentPlayer.id}</h3>
      </div>
      
      <div className="player-stats">
        <div className="stat">
          <span className="stat-label">Position:</span>
          <span className="stat-value">{currentPlayer.position}</span>
        </div>
        <div className="stat correct">
          <span className="stat-label">✓ Correct:</span>
          <span className="stat-value">{currentPlayer.correctCount}</span>
        </div>
        <div className="stat incorrect">
          <span className="stat-label">✗ Incorrect:</span>
          <span className="stat-value">{currentPlayer.incorrectCount}</span>
        </div>
      </div>
      
      {players.length > 1 && (
        <div className="all-players">
          <h4>All Players</h4>
          <div className="players-list">
            {players.map(player => (
              <div 
                key={player.id}
                className={`player-item ${player.id === currentPlayer.id ? 'active' : ''}`}
              >
                <div 
                  className="player-token-small"
                  style={{ backgroundColor: player.color }}
                >
                  {player.id}
                </div>
                <div className="player-info">
                  <div>Position: {player.position}</div>
                  <div className="mini-stats">
                    ✓{player.correctCount} ✗{player.incorrectCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
