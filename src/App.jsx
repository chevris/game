import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { QuestionPanel } from './components/QuestionPanel';
import { DiceRoller } from './components/DiceRoller';
import { TurnIndicator } from './components/TurnIndicator';
import { WinScreen } from './components/WinScreen';
import './App.css';

function App() {
  const gameStatus = useGameStore(state => state.gameStatus);
  const loadQuestions = useGameStore(state => state.loadQuestions);
  
  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);
  
  if (gameStatus === 'setup') {
    return <GameSetup />;
  }
  
  return (
    <div className="app-container">
      {gameStatus === 'finished' && <WinScreen />}
      
      <div className="game-layout">
        <div className="board-section">
          <GameBoard />
        </div>
        
        <div className="controls-section">
          <TurnIndicator />
          <QuestionPanel />
          <DiceRoller />
        </div>
      </div>
    </div>
  );
}

export default App;
