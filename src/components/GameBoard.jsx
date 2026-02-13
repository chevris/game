import { useGameStore } from '../store/gameStore';
import './GameBoard.css';

export function GameBoard() {
  const boardSize = useGameStore(state => state.boardSize);
  const spiralPath = useGameStore(state => state.spiralPath);
  const players = useGameStore(state => state.players);
  const centerIndex = useGameStore(state => state.centerIndex);
  
  // Create 2D grid from spiral path
  const grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  
  spiralPath.forEach((cell, index) => {
    grid[cell.y][cell.x] = index;
  });
  
  // Get players at each position
  const getPlayersAtPosition = (pathIndex) => {
    return players.filter(p => p.position === pathIndex);
  };
  
  return (
    <div className="game-board-container">
      <div 
        className="game-board" 
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`
        }}
      >
        {grid.map((row, y) => 
          row.map((pathIndex, x) => {
            const playersHere = getPlayersAtPosition(pathIndex);
            const isCenter = pathIndex === centerIndex;
            
            return (
              <div 
                key={`${x}-${y}`}
                className={`board-cell ${isCenter ? 'center' : ''}`}
              >
                <span className="cell-number">{pathIndex}</span>
                {playersHere.length > 0 && (
                  <div className="player-tokens">
                    {playersHere.map(player => (
                      <div 
                        key={player.id}
                        className="player-token"
                        style={{ backgroundColor: player.color }}
                        title={`Player ${player.id}`}
                      >
                        {player.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
