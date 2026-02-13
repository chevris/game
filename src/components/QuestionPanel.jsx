import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import './QuestionPanel.css';

export function QuestionPanel() {
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const playerAnswer = useGameStore(state => state.playerAnswer);
  const submitAnswer = useGameStore(state => state.submitAnswer);
  
  const isAnswered = playerAnswer !== null;
  const isCorrect = isAnswered && playerAnswer === currentQuestion?.correct;
  
  // Text-to-speech for question
  useSpeechSynthesis(currentQuestion?.text, !isAnswered);
  
  // Voice recognition for answers
  const { supported, listening, error, start } = useSpeechRecognition(
    (answer) => {
      if (!isAnswered) {
        submitAnswer(answer);
      }
    },
    !isAnswered
  );
  
  // Auto-start voice recognition when question appears
  useEffect(() => {
    if (currentQuestion && !isAnswered && supported) {
      const timer = setTimeout(() => start(), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isAnswered, supported, start]);
  
  if (!currentQuestion) {
    return (
      <div className="question-panel">
        <p className="loading">Loading question...</p>
      </div>
    );
  }
  
  return (
    <div className="question-panel">
      <div className="difficulty-indicator">
        <span>Difficulty: </span>
        {'⭐'.repeat(currentQuestion.difficulty)}
      </div>
      
      <div className="question-text">
        {currentQuestion.text}
      </div>
      
      {!isAnswered && supported && (
        <div className={`voice-status ${listening ? 'listening' : ''} ${error ? 'error' : ''}`}>
          {listening && '🎤 Listening... Say A, B, or C'}
          {error && `⚠️ ${error}`}
          {!listening && !error && '🎤 Voice recognition ready'}
        </div>
      )}
      
      {!supported && (
        <div className="voice-status not-supported">
          ⓘ Voice not supported - use buttons below
        </div>
      )}
      
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
          {!isCorrect && ` Correct answer: ${currentQuestion.correct}`}
        </div>
      )}
    </div>
  );
}
