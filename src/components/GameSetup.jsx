import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './GameSetup.css';

export function GameSetup() {
  const [playerCount, setPlayerCount] = useState(1);
  const [boardSize, setBoardSize] = useState(11);
  const initializeGame = useGameStore(state => state.initializeGame);
  
  const handleStart = () => {
    if (boardSize % 2 === 0) {
      alert('Board size must be an odd number!');
      return;
    }
    initializeGame(playerCount, boardSize);
  };
  
  const oddSizes = [5, 7, 9, 11, 13, 15, 17, 19, 21];
  
  return (
    <div className="game-setup">
      <h1>Spiral Quiz Game</h1>
      <p>Beantworte Fragen über deutsche Geschichte und Geografie!</p>
      
      <div className="setup-form">
        <div className="form-group">
          <label htmlFor="player-count">Number of Players:</label>
          <select 
            id="player-count"
            value={playerCount} 
            onChange={(e) => setPlayerCount(Number(e.target.value))}
          >
            <option value={1}>1 Player</option>
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="board-size">Board Size:</label>
          <select 
            id="board-size"
            value={boardSize} 
            onChange={(e) => setBoardSize(Number(e.target.value))}
          >
            {oddSizes.map(size => (
              <option key={size} value={size}>
                {size}×{size} ({size * size} cells)
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className="start-button" 
          onClick={handleStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
