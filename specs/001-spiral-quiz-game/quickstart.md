# Quickstart Guide: Spiral Quiz Game

**Last Updated**: 2026-02-13  
**Target Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for building the Spiral Quiz Game MVP. Follow the phases in order to maintain separation of concerns and ensure constitution compliance.

## Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser (Chrome, Firefox, Edge, Safari)
- Code editor (VS Code recommended)
- Basic React knowledge

## Project Setup

### 1. Initialize Dependencies

The project already exists with React + Vite. Add Zustand:

```bash
cd /home/teva/develop/tests/poupouille/game
npm install zustand
```

### 2. Create Folder Structure

```bash
mkdir -p src/components src/store src/engine src/hooks src/utils public/data
```

### 3. Verify Constitution Compliance

- ✅ JavaScript only (no TypeScript)
- ✅ React + Vite already configured
- ✅ Zustand added for state management
- ✅ No backend, no persistence, no testing frameworks

---

## Implementation Phases

### Phase 1: Core Game Engine (Pure Logic)

**Duration**: ~2-3 hours  
**Files**: `src/engine/`

#### Step 1.1: Spiral Path Generator

Create `src/engine/spiralGenerator.js`:

```javascript
/**
 * Generates a clockwise spiral path from top-left to center
 * @param {number} size - Board size (must be odd)
 * @returns {Array<{x: number, y: number}>} Ordered path array
 */
export function generateSpiral(size) {
  if (size % 2 === 0) throw new Error('Board size must be odd');
  
  const grid = Array(size).fill().map(() => Array(size).fill(false));
  const path = [];
  let x = 0, y = 0;
  let dx = 1, dy = 0; // Start moving right
  
  for (let i = 0; i < size * size; i++) {
    path.push({ x, y });
    grid[y][x] = true;
    
    const nx = x + dx, ny = y + dy;
    
    // Turn clockwise if hit boundary or visited cell
    if (nx < 0 || nx >= size || ny < 0 || ny >= size || grid[ny][nx]) {
      [dx, dy] = [-dy, dx]; // Rotate 90° clockwise
    }
    
    x += dx;
    y += dy;
  }
  
  return path;
}

/**
 * Calculate center cell index for odd-sized board
 */
export function getCenterIndex(size) {
  return Math.floor((size * size) / 2);
}
```

**Test**: `console.log(generateSpiral(5))` → should output 25 coordinates ending at {x: 2, y: 2}

#### Step 1.2: Movement Engine

Create `src/engine/movementEngine.js`:

```javascript
/**
 * Calculate new position after dice roll
 * @param {number} currentIndex - Current position in spiral path
 * @param {number} diceRoll - Dice result (1-6)
 * @param {number} centerIndex - Index of center cell
 * @returns {number} New position (clamped to center)
 */
export function movePlayer(currentIndex, diceRoll, centerIndex) {
  const newIndex = currentIndex + diceRoll;
  return Math.min(newIndex, centerIndex);
}
```

#### Step 1.3: Victory Checker

Create `src/engine/victoryChecker.js`:

```javascript
/**
 * Check if player has reached center (win condition)
 */
export function checkWin(position, centerIndex) {
  return position >= centerIndex;
}
```

#### Step 1.4: Difficulty Mapper

Create `src/engine/difficultyMapper.js`:

```javascript
/**
 * Map player position to difficulty level (1-5)
 */
export function getDifficulty(position, totalCells) {
  const progress = position / totalCells;
  
  if (progress < 0.17) return 1;
  if (progress < 0.41) return 2;
  if (progress < 0.66) return 3;
  if (progress < 0.83) return 4;
  return 5;
}
```

#### Step 1.5: Question Selector

Create `src/engine/questionSelector.js`:

```javascript
/**
 * Select a question based on difficulty and exclusion rules
 */
export function selectQuestion(questions, difficulty, playerUsedIds, otherPlayersOnCellIds = []) {
  const excludedIds = new Set([...playerUsedIds, ...otherPlayersOnCellIds]);
  
  let available = questions.filter(q => 
    q.difficulty === difficulty && !excludedIds.has(q.id)
  );
  
  // Fallback to next difficulty if no questions available
  if (available.length === 0 && difficulty < 5) {
    available = questions.filter(q => 
      q.difficulty === difficulty + 1 && !excludedIds.has(q.id)
    );
  }
  
  if (available.length === 0) {
    console.warn('No questions available for difficulty', difficulty);
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get IDs of questions answered by other players on same cell
 */
export function getOtherPlayersQuestions(players, currentPlayerId, currentPosition) {
  return players
    .filter(p => p.id !== currentPlayerId && p.position === currentPosition)
    .flatMap(p => p.answeredQuestions);
}
```

---

### Phase 2: State Management (Zustand)

**Duration**: ~2-3 hours  
**File**: `src/store/gameStore.js`

```javascript
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
    get().presentQuestion();
  },
  
  loadQuestions: async () => {
    try {
      const response = await fetch('/data/questions.json');
      const data = await response.json();
      set({ questions: data.questions || data });
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  },
  
  presentQuestion: () => {
    const { players, currentTurnIndex, questions, spiralPath } = get();
    const currentPlayer = players[currentTurnIndex];
    
    const difficulty = getDifficulty(currentPlayer.position, spiralPath.length);
    const otherIds = getOtherPlayersQuestions(players, currentPlayer.id, currentPlayer.position);
    
    const question = selectQuestion(
      questions,
      difficulty,
      currentPlayer.answeredQuestions,
      otherIds
    );
    
    set({ currentQuestion: question, playerAnswer: null, diceRoll: null });
  },
  
  submitAnswer: (answer) => {
    const { currentQuestion, players, currentTurnIndex } = get();
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
  
  rollDice: () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    set({ diceRoll: roll });
    
    // Move player after brief delay
    setTimeout(() => get().moveCurrentPlayer(roll), 1000);
  },
  
  moveCurrentPlayer: (steps) => {
    const { players, currentTurnIndex, spiralPath, centerIndex } = get();
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentTurnIndex];
    
    const newPosition = movePlayer(currentPlayer.position, steps, centerIndex);
    currentPlayer.position = newPosition;
    
    set({ players: updatedPlayers });
    
    // Check win condition
    if (checkWin(newPosition, centerIndex)) {
      set({ gameStatus: 'finished', winner: currentPlayer.id });
    } else {
      setTimeout(() => get().nextTurn(), 1500);
    }
  },
  
  nextTurn: () => {
    const { players, currentTurnIndex } = get();
    const nextIndex = (currentTurnIndex + 1) % players.length;
    
    set({ 
      currentTurnIndex: nextIndex,
      currentQuestion: null,
      playerAnswer: null,
      diceRoll: null
    });
    
    get().presentQuestion();
  },
  
  resetGame: () => {
    set({
      gameStatus: 'setup',
      players: [],
      currentTurnIndex: 0,
      winner: null,
      currentQuestion: null,
      playerAnswer: null,
      diceRoll: null
    });
  }
}));
```

---

### Phase 3: Question System

**Duration**: ~1 hour

#### Step 3.1: Create Questions JSON

Copy the sample questions from `specs/001-spiral-quiz-game/contracts/questions-sample.json` to `public/data/questions.json`.

```bash
mkdir -p public/data
cp specs/001-spiral-quiz-game/contracts/questions-sample.json public/data/questions.json
```

#### Step 3.2: Load Questions on App Mount

In `src/App.jsx`:

```javascript
import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';

function App() {
  const loadQuestions = useGameStore(state => state.loadQuestions);
  
  useEffect(() => {
    loadQuestions();
  }, []);
  
  // ... rest of app
}
```

---

### Phase 4: Voice Integration

**Duration**: ~2-3 hours  
**Files**: `src/hooks/`

#### Step 4.1: Speech Synthesis Hook

Create `src/hooks/useSpeechSynthesis.js`:

```javascript
import { useEffect } from 'react';

export function useSpeechSynthesis(text, shouldSpeak) {
  useEffect(() => {
    if (!shouldSpeak || !text) return;
    
    if (!('speechSynthesis' in window)) {
      console.warn('TTS not supported');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    
    // Wait for voices to load
    const speak = () => {
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) utterance.voice = germanVoice;
      
      speechSynthesis.speak(utterance);
    };
    
    if (speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
    }
    
    return () => speechSynthesis.cancel();
  }, [text, shouldSpeak]);
}
```

#### Step 4.2: Speech Recognition Hook

Create `src/hooks/useSpeechRecognition.js`:

```javascript
import { useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(onResult, isActive) {
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toUpperCase().trim();
      if (['A', 'B', 'C'].includes(transcript)) {
        onResult(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);
  
  useEffect(() => {
    if (!isActive || !isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.warn('Failed to start recognition:', error);
    }
    
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, isSupported]);
  
  return { isSupported };
}
```

---

### Phase 5: UI Components

**Duration**: ~4-6 hours  
**Files**: `src/components/`

#### Step 5.1: Game Setup

Create `src/components/GameSetup.jsx`:

```javascript
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function GameSetup() {
  const [playerCount, setPlayerCount] = useState(2);
  const initializeGame = useGameStore(state => state.initializeGame);
  
  return (
    <div className="game-setup">
      <h1>Spiral Quiz Game</h1>
      <div>
        <label>
          Number of Players:
          <select value={playerCount} onChange={(e) => setPlayerCount(+e.target.value)}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <button onClick={() => initializeGame(playerCount)}>Start Game</button>
    </div>
  );
}
```

#### Step 5.2: Game Board

Create `src/components/GameBoard.jsx` (simplified - expand based on design needs):

```javascript
import { useGameStore } from '../store/gameStore';

export function GameBoard() {
  const { spiralPath, players, boardSize } = useGameStore(state => ({
    spiralPath: state.spiralPath,
    players: state.players,
    boardSize: state.boardSize
  }));
  
  return (
    <div className="game-board" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${boardSize}, 40px)`,
      gap: '2px'
    }}>
      {spiralPath.map((cell, index) => (
        <div key={index} className="cell" style={{
          width: '40px',
          height: '40px',
          border: '1px solid #ccc',
          position: 'relative'
        }}>
          {players.filter(p => p.position === index).map(player => (
            <div key={player.id} style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: player.color,
              position: 'absolute'
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Step 5.3: Question Panel

Create `src/components/QuestionPanel.jsx`:

```javascript
import { useGameStore } from '../store/gameStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function QuestionPanel() {
  const { currentQuestion, submitAnswer, playerAnswer } = useGameStore(state => ({
    currentQuestion: state.currentQuestion,
    submitAnswer: state.submitAnswer,
    playerAnswer: state.playerAnswer
  }));
  
  const shouldSpeak = currentQuestion && !playerAnswer;
  useSpeechSynthesis(currentQuestion?.text, shouldSpeak);
  
  const { isSupported } = useSpeechRecognition(
    (answer) => !playerAnswer && submitAnswer(answer),
    shouldSpeak
  );
  
  if (!currentQuestion) return <div>Loading question...</div>;
  
  return (
    <div className="question-panel">
      <h2>{currentQuestion.text}</h2>
      <div className="answers">
        {['A', 'B', 'C'].map((letter, idx) => (
          <button
            key={letter}
            onClick={() => submitAnswer(letter)}
            disabled={playerAnswer !== null}
          >
            {letter}: {currentQuestion.answers[idx]}
          </button>
        ))}
      </div>
      {!isSupported && <p>Voice not supported - use buttons</p>}
    </div>
  );
}
```

#### Step 5.4-5.8: Remaining Components

Follow similar patterns for:
- `DiceRoller.jsx`: Shows dice animation and roll button
- `TurnIndicator.jsx`: Displays current player
- `WinScreen.jsx`: Victory message
- Update `App.jsx` to orchestrate all components

---

### Phase 6: Game Flow Wiring

**Duration**: ~2 hours

In `src/App.jsx`, wire everything together:

```javascript
import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { QuestionPanel } from './components/QuestionPanel';
// ... import other components

function App() {
  const { gameStatus, loadQuestions } = useGameStore(state => ({
    gameStatus: state.gameStatus,
    loadQuestions: state.loadQuestions
  }));
  
  useEffect(() => {
    loadQuestions();
  }, []);
  
  if (gameStatus === 'setup') {
    return <GameSetup />;
  }
  
  if (gameStatus === 'finished') {
    return <WinScreen />;
  }
  
  return (
    <div className="app">
      <div className="left-panel">
        <GameBoard />
      </div>
      <div className="right-panel">
        <TurnIndicator />
        <QuestionPanel />
        <DiceRoller />
      </div>
    </div>
  );
}
```

---

## Running the Game

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Testing Checklist

Manual tests to perform (no automated tests per constitution):

- [ ] Spiral path generates correctly (visualize 11x11 grid)
- [ ] All players start at position 0
- [ ] Questions are read aloud in German
- [ ] Voice recognition captures A/B/C (test in Chrome)
- [ ] Button fallback works
- [ ] Correct answer allows dice roll
- [ ] Incorrect answer ends turn
- [ ] Player moves correct number of cells
- [ ] Win condition triggers at center
- [ ] Game stops when player wins
- [ ] 2-4 player turns rotate correctly
- [ ] No question repeats for same player
- [ ] Players on same cell get different questions

---

## Troubleshooting

**Voice not working**: 
- Check browser console for errors
- Ensure HTTPS or localhost (required for mic permission)
- Try Chrome/Edge (best Web Speech API support)

**Questions not loading**:
- Verify `/public/data/questions.json` exists
- Check browser network tab for 404 errors

**Spiral looks wrong**:
- Use browser DevTools to inspect `spiralPath` array
- Center should be at index 60 for 11x11 grid

---

## Next Steps

After MVP is working:
1. Add CSS styling for better visuals
2. Add animations for dice roll and movement
3. Improve spiral visualization (optional: draw path lines)
4. Add sound effects (optional, not in MVP scope)
5. User testing and refinements

Refer to [spec.md](spec.md) for full requirements and [data-model.md](data-model.md) for state structure details.
