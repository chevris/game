import { useGameStore } from '../store/gameStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import './QuestionPanel.css';

export function QuestionPanel() {
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const playerAnswer = useGameStore(state => state.playerAnswer);
  const submitAnswer = useGameStore(state => state.submitAnswer);
  
  const isAnswered = playerAnswer !== null;
  const isCorrect = isAnswered && playerAnswer === currentQuestion?.correct;
  
  // Text-to-speech for question
  useSpeechSynthesis(currentQuestion?.text, !isAnswered);
  
  if (!currentQuestion) {
    return (
      <div className="question-panel">
        <p className="loading">Frage wird geladen…</p>
      </div>
    );
  }
  
  return (
    <div className="question-panel">
      <div className="difficulty-indicator">
        <span>Schwierigkeit: </span>
        {'⭐'.repeat(currentQuestion.difficulty)}
      </div>
      
      <div className="question-text">
        {currentQuestion.text}
      </div>
      
      <div className="answer-buttons">
        {['A', 'B', 'C'].map((letter, index) => {
          const isThisAnswer = playerAnswer === letter;
          const isCorrectAnswer = currentQuestion.correct === letter;
          
          let className = 'answer-button';
          if (isAnswered) {
            if (isThisAnswer && isCorrect) {
              className += ' correct';
            } else if (isThisAnswer && !isCorrect) {
              className += ' incorrect';
            } else if (isCorrectAnswer) {
              className += ' correct-answer';
            }
          }
          
          return (
            <button
              key={letter}
              className={className}
              onClick={() => !isAnswered && submitAnswer(letter)}
              disabled={isAnswered}
            >
              <span className="letter">{letter}</span>
              <span className="text">{currentQuestion.answers[index]}</span>
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✓ Richtig!' : '✗ Falsch!'}
          {!isCorrect && ` Richtige Antwort: ${currentQuestion.correct}`}
        </div>
      )}
    </div>
  );
}
