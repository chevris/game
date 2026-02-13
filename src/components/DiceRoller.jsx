import { useGameStore } from '../store/gameStore';
import './DiceRoller.css';

export function DiceRoller() {
  const playerAnswer = useGameStore(state => state.playerAnswer);
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const diceRoll = useGameStore(state => state.diceRoll);
  const rollDice = useGameStore(state => state.rollDice);
  
  const isCorrect = playerAnswer === currentQuestion?.correct;
  const canRoll = playerAnswer !== null && isCorrect && diceRoll === null;
  const hasRolled = diceRoll !== null;
  
  return (
    <div className="dice-roller">
      <h3>Dice Roll</h3>
      
      {hasRolled ? (
        <div className="dice-result">
          <div className="dice-face">{diceRoll}</div>
          <p>Move {diceRoll} step{diceRoll !== 1 ? 's' : ''}!</p>
        </div>
      ) : (
        <button 
          className="roll-button"
          onClick={rollDice}
          disabled={!canRoll}
        >
          {canRoll ? 'Roll Dice' : 'Answer correctly to roll'}
        </button>
      )}
    </div>
  );
}
