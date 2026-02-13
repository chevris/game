import { create } from 'zustand';
import { generateSpiral, getCenterIndex } from '../engine/spiralGenerator';
import { movePlayer } from '../engine/movementEngine';
import { checkWin } from '../engine/victoryChecker';
import { getDifficulty } from '../engine/difficultyMapper';
import { selectQuestion, getOtherPlayersQuestions } from '../engine/questionSelector';

export const useGameStore = create((set, get) => ({
  // Game state
  boardSize: 11,
  spiralPath: [],
  centerIndex: 0,
  gameStatus: 'setup', // 'setup' | 'playing' | 'finished'
  currentTurnIndex: 0,
  winner: null,
  
  // Players
  players: [],
  
  // Questions
  questions: [],
  currentQuestion: null,
  
  // Turn state
  playerAnswer: null,
  diceRoll: null,
  
  // Actions
  
  /**
   * Initialize a new game with specified players and board size
   * @param {number} playerCount - Number of players (1-4)
   * @param {number} boardSize - Board size (must be odd, default 11)
   */
  initializeGame: (playerCount, boardSize = 11) => {
    const spiral = generateSpiral(boardSize);
    const center = getCenterIndex(boardSize);
    
    set({
      boardSize,
      spiralPath: spiral,
      centerIndex: center,
      players: Array.from({ length: playerCount }, (_, i) => ({
        id: i + 1,
        position: 0,
        answeredQuestions: [],
        correctCount: 0,
        incorrectCount: 0,
        color: ['red', 'blue', 'green', 'yellow'][i]
      })),
      gameStatus: 'playing',
      currentTurnIndex: 0,
      winner: null,
      currentQuestion: null,
      playerAnswer: null,
      diceRoll: null
    });
    
    // Present first question
    setTimeout(() => get().presentQuestion(), 100);
  },
  
  /**
   * Load questions from JSON file
   */
  loadQuestions: async () => {
    try {
      const response = await fetch('/data/questions.json');
      const data = await response.json();
      set({ questions: data.questions || data });
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  },
  
  /**
   * Present a question to the current player
   */
  presentQuestion: () => {
    const { players, currentTurnIndex, questions, spiralPath } = get();
    const currentPlayer = players[currentTurnIndex];
    
    if (!currentPlayer || questions.length === 0) {
      console.warn('Cannot present question: missing player or questions');
      return;
    }
    
    const difficulty = getDifficulty(currentPlayer.position, spiralPath.length);
    const otherIds = getOtherPlayersQuestions(players, currentPlayer.id, currentPlayer.position);
    
    const question = selectQuestion(
      questions,
      difficulty,
      currentPlayer.answeredQuestions,
      otherIds
    );
    
    if (!question) {
      console.error('No questions available - game cannot continue');
      return;
    }
    
    set({ currentQuestion: question, playerAnswer: null, diceRoll: null });
  },
  
  /**
   * Submit an answer for the current question
   * @param {string} answer - Answer choice ('A', 'B', or 'C')
   */
  submitAnswer: (answer) => {
    const { currentQuestion, players, currentTurnIndex } = get();
    
    if (!currentQuestion) {
      console.warn('No current question to answer');
      return;
    }
    
    const isCorrect = answer === currentQuestion.correct;
    
    // Update player stats and answered questions
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentTurnIndex];
    currentPlayer.answeredQuestions.push(currentQuestion.id);
    
    if (isCorrect) {
      currentPlayer.correctCount++;
    } else {
      currentPlayer.incorrectCount++;
    }
    
    set({ playerAnswer: answer, players: updatedPlayers });
    
    if (!isCorrect) {
      // End turn immediately if incorrect
      setTimeout(() => get().nextTurn(), 1500);
    }
  },
  
  /**
   * Roll the dice (only after correct answer)
   * @returns {number} Dice result (1-6)
   */
  rollDice: () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    set({ diceRoll: roll });
    
    // Automatically move player after dice roll
    setTimeout(() => get().moveCurrentPlayer(roll), 500);
    
    return roll;
  },
  
  /**
   * Move current player by specified steps
   * @param {number} steps - Number of steps to move
   */
  moveCurrentPlayer: (steps) => {
    const { players, currentTurnIndex, centerIndex } = get();
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentTurnIndex];
    
    const newPosition = movePlayer(currentPlayer.position, steps, centerIndex);
    currentPlayer.position = newPosition;
    
    set({ players: updatedPlayers });
    
    // Check for win condition
    if (checkWin(newPosition, centerIndex)) {
      set({ 
        gameStatus: 'finished',
        winner: currentPlayer.id
      });
    } else {
      // Continue to next turn
      setTimeout(() => get().nextTurn(), 1500);
    }
  },
  
  /**
   * Advance to the next player's turn
   */
  nextTurn: () => {
    const { players, currentTurnIndex, gameStatus } = get();
    
    if (gameStatus !== 'playing') {
      return;
    }
    
    const nextIndex = (currentTurnIndex + 1) % players.length;
    
    set({
      currentTurnIndex: nextIndex,
      currentQuestion: null,
      playerAnswer: null,
      diceRoll: null
    });
    
    // Present question for next player
    setTimeout(() => get().presentQuestion(), 100);
  },
  
  /**
   * Reset game to initial setup state
   */
  resetGame: () => {
    set({
      boardSize: 11,
      spiralPath: [],
      centerIndex: 0,
      gameStatus: 'setup',
      currentTurnIndex: 0,
      winner: null,
      players: [],
      currentQuestion: null,
      playerAnswer: null,
      diceRoll: null
    });
  }
}));
