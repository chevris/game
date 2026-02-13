# Data Model: Spiral Quiz Game

**Date**: 2026-02-13  
**Input**: [spec.md](spec.md) functional requirements and key entities

## Overview

This document defines the data entities, their relationships, and state lifecycle for the Spiral Quiz Game. All data exists in-memory only (Zustand store) per constitution mandate.

## Entities

### 1. Game Session

Represents the active game instance and board configuration.

**Attributes**:
- `boardSize` (number): Grid dimensions (must be odd, default 11)
- `spiralPath` (array): Ordered list of {x, y} coordinates forming clockwise spiral
- `centerIndex` (number): Index of center cell in spiralPath array
- `gameStatus` (enum): Current game state
  - `'setup'`: Player selection screen
  - `'playing'`: Active game in progress
  - `'finished'`: Game completed, winner declared
- `currentTurnIndex` (number): Index into players array (0-based)
- `winner` (number | null): Player ID of winner, or null if game ongoing
- `createdAt` (timestamp): Game start time (optional, for session duration tracking)

**Validation Rules**:
- `boardSize` must be odd number ≥ 5 (FR-002)
- `spiralPath.length` must equal `boardSize²`
- `centerIndex` must equal `Math.floor((boardSize² - 1) / 2)`
- `currentTurnIndex` must be < `players.length`

**Lifecycle**:
1. Created on game start with `initializeGame()`
2. Updated on each turn via `nextTurn()`
3. Marked finished when `checkWin()` returns true

**Relationships**:
- One-to-many with Player (1 game has 1-4 players)
- One-to-one with Question (1 active question per turn)

---

### 2. Player

Represents a participant in the game session.

**Attributes**:
- `id` (number): Unique player identifier (1-4)
- `position` (number): Current index in spiralPath array (0-based)
- `answeredQuestions` (array): List of question IDs already presented to this player
- `correctCount` (number): Count of correct answers
- `incorrectCount` (number): Count of incorrect answers
- `color` (string): UI color for token (e.g., 'red', 'blue', 'green', 'yellow')

**Validation Rules**:
- `id` must be unique within game session (1-4)
- `position` must be ≥ 0 and < `spiralPath.length`
- `answeredQuestions` must not contain duplicates (Set semantics)
- `correctCount + incorrectCount` = total turns taken by this player

**Lifecycle**:
1. Created on game initialization with position = 0
2. Position updated on correct answer + dice roll
3. answeredQuestions array grows on each question presentation
4. Stats (correct/incorrect) increment based on answer validation

**Relationships**:
- Many-to-one with Game Session
- Many-to-many with Question (via answeredQuestions tracking)

**State Transitions**:
```
position: 0 → [answer correct] → roll dice → position + diceRoll → check win
         ↓
    [answer incorrect] → position unchanged → next player's turn
```

---

### 3. Spiral Board

Represents the visual board and path structure (derived state, not stored separately).

**Attributes**:
- `dimensions` (number): Board size (alias for Game.boardSize)
- `path` (array): Reference to Game.spiralPath
- `centerCoordinate` ({x, y}): Coordinates of center cell

**Computed Properties**:
- `centerCoordinate`: `spiralPath[centerIndex]`
- Grid visual representation: 2D array derived from spiralPath for rendering

**Lifecycle**:
- Generated once per game during `initializeGame()`
- Immutable throughout game session

**Relationships**:
- Owned by Game Session (composition)

---

### 4. Question

Represents a quiz question with answers.

**Attributes**:
- `id` (number): Unique question identifier
- `text` (string): Question text in German
- `answers` (array[3]): Array of 3 answer option strings
- `correct` (string): Correct answer indicator ('A', 'B', or 'C')
- `difficulty` (number): Difficulty level (1-5)
- `category` (string): Topic category ('history' | 'geography')

**Validation Rules**:
- `id` must be unique across all questions
- `answers` must have exactly 3 elements (FR-009)
- `correct` must be 'A', 'B', or 'C'
- `difficulty` must be 1, 2, 3, 4, or 5 (FR-011)
- `category` must be 'history' or 'geography' (FR-010)

**Lifecycle**:
1. Loaded from `/public/data/questions.json` on app mount
2. Selected based on difficulty mapping and exclusion rules
3. Presented to current player
4. ID added to player's answeredQuestions after presentation

**Relationships**:
- One-to-one with Turn (1 question per turn)
- Many-to-many with Player (tracking via answeredQuestions)

**Selection Algorithm** (FR-012, FR-013, FR-014, FR-015):
```javascript
difficulty = getDifficulty(player.position, spiralPath.length);
excludedIds = player.answeredQuestions ∪ otherPlayersOnSameCellQuestions;
availableQuestions = questions.filter(q => 
  q.difficulty === difficulty && !excludedIds.includes(q.id)
);

// Fallback cascade if no questions available at target difficulty
if (availableQuestions.length === 0) {
  // Try adjacent difficulties bidirectionally: L3 → L2, L4 → L2, L5
  const fallbackOrder = [difficulty - 1, difficulty + 1, difficulty - 2, difficulty + 2];
  for (const fallbackDiff of fallbackOrder) {
    if (fallbackDiff >= 1 && fallbackDiff <= 5) {
      availableQuestions = questions.filter(q => 
        q.difficulty === fallbackDiff && !excludedIds.includes(q.id)
      );
      if (availableQuestions.length > 0) break;
    }
  }
}

selectedQuestion = random(availableQuestions);
```

**Fallback Strategy**: Searches adjacent difficulties bidirectionally (e.g., L3 → L2 → L4 → L1 → L5) to maintain difficulty proximity while ensuring question availability.

---

### 5. Turn

Represents a single player's action sequence (ephemeral state, not persisted).

**Attributes**:
- `playerId` (number): Player taking this turn
- `question` (Question): Presented question
- `playerAnswer` (string | null): Player's submitted answer ('A', 'B', 'C', or null)
- `isCorrect` (boolean | null): Answer validation result
- `diceRoll` (number | null): Dice result if answer correct (1-6, or null)
- `startPosition` (number): Player position before turn
- `endPosition` (number): Player position after turn
- `timestamp` (timestamp): Turn start time (optional)

**Validation Rules**:
- `playerAnswer` must be 'A', 'B', 'C', or null
- `diceRoll` must be 1-6 if answer correct, null if incorrect
- `endPosition` = `startPosition + diceRoll` (clamped to centerIndex)

**Lifecycle**:
1. Created when turn starts (question presented)
2. Updated when player submits answer
3. Updated when dice rolled (if correct answer)
4. Completed when player position updated
5. Archived/discarded on next turn (not stored in state)

**State Machine**:
```
QUESTION_DISPLAY → WAITING_FOR_ANSWER → ANSWER_VALIDATION
                                             ↓
                     ┌──────── [incorrect] ──┴─→ TURN_END
                     ↓
              [correct] → DICE_ROLL → MOVE_PLAYER → CHECK_WIN
                                                        ↓
                                      [no win] → TURN_END → NEXT_TURN
                                      [win] → GAME_END
```

---

## Relationships Diagram

```
Game Session (1)
  ├─ has ──→ Players (1-4)
  │            └─ answered ──→ Questions (many)
  ├─ has ──→ Spiral Board (1)
  └─ presents ──→ Current Question (0-1)

Turn (ephemeral)
  ├─ references ──→ Player (1)
  └─ presents ──→ Question (1)
```

---

## State Schema (Zustand Store)

```javascript
{
  // Game Session
  boardSize: 11,
  spiralPath: [{x: 0, y: 0}, {x: 1, y: 0}, ...], // 121 cells for 11x11
  centerIndex: 60,
  gameStatus: 'setup' | 'playing' | 'finished',
  currentTurnIndex: 0,
  winner: null,
  
  // Players
  players: [
    {
      id: 1,
      position: 0,
      answeredQuestions: [42, 17, 89],
      correctCount: 2,
      incorrectCount: 1,
      color: 'red'
    },
    // ... up to 3 more players
  ],
  
  // Questions (loaded from JSON)
  questions: [
    {
      id: 1,
      text: "Wann fiel die Berliner Mauer?",
      answers: ["1987", "1989", "1991"],
      correct: "B",
      difficulty: 2,
      category: "history"
    },
    // ... more questions
  ],
  
  // Current Turn State (ephemeral)
  currentQuestion: null | Question,
  playerAnswer: null | 'A' | 'B' | 'C',
  diceRoll: null | 1-6,
  
  // Actions (methods)
  initializeGame: (playerCount, boardSize) => void,
  loadQuestions: (questionsArray) => void,
  presentQuestion: () => void,
  submitAnswer: (answer) => void,
  rollDice: () => void,
  moveCurrentPlayer: (steps) => void,
  checkWinCondition: () => boolean,
  nextTurn: () => void,
  resetGame: () => void
}
```

---

## Data Flow

### Game Initialization
```
User selects player count (1-4) and board size (odd number)
  ↓
initializeGame(count, size)
  ↓
Generate spiral path: spiralPath = generateSpiral(size)
  ↓
Calculate center: centerIndex = floor((size² - 1) / 2)
  ↓
Create players: players = [{id, position: 0, ...}, ...]
  ↓
Set gameStatus = 'playing'
```

### Turn Flow
```
presentQuestion()
  ↓
Get current player: player = players[currentTurnIndex]
  ↓
Calculate difficulty: difficulty = getDifficulty(player.position, totalCells)
  ↓
Select question: selectQuestion(difficulty, player.answeredQuestions, ...)
  ↓
Set currentQuestion = selected question
  ↓
Trigger TTS: speakGerman(question.text)
  ↓
Wait for player input (voice or button)
  ↓
submitAnswer(answer)
  ↓
Validate: isCorrect = (answer === question.correct)
  ↓
Add question.id to player.answeredQuestions
  ↓
if (isCorrect) {
  rollDice() → generate random 1-6
  moveCurrentPlayer(diceRoll)
  if (checkWinCondition()) {
    gameStatus = 'finished'
    winner = currentPlayer.id
    STOP
  }
}
  ↓
nextTurn() → currentTurnIndex = (currentTurnIndex + 1) % players.length
```

---

## Persistence Strategy

**Constitution Mandate**: No persistence allowed (FR-037, A-009)

- All state in Zustand store (in-memory)
- Questions loaded once from static JSON file
- Browser refresh = full game reset
- No localStorage, no IndexedDB, no cookies

**Implications**:
- Game must be completable in single browser session
- No save/load feature
- No game history tracking across sessions
- Acceptable trade-off for MVP per constitution

---

## Validation & Constraints

### Board Size
- Must be odd number (FR-002)
- Minimum: 5x5 (25 cells)
- Maximum: 21x21 (441 cells) per SC-009
- Default: 11x11 (121 cells)

### Players
- Minimum: 1 (single player)
- Maximum: 4 (FR-005)
- All start at position 0 (FR-006)

### Questions
- Minimum viable: ~50 questions (10 per difficulty level)
- Recommended: 100+ for better variety
- Each question presented max once per player (FR-014)

### Dice
- Range: 1-6 (standard six-sided die, FR-022)
- Movement: Clamp to centerIndex if roll exceeds (edge case handled)

---

## Edge Case Handling

Per spec edge cases:

1. **Player rolls beyond center**: Position clamped to centerIndex, win triggered
2. **Multiple players on same cell**: Allowed; UI handles visual stacking
3. **Question pool exhaustion**: Escalate to next difficulty level or wrap to lower
4. **Only 1 player in game**: Proceeds normally (no minimum enforcement)

---

## Performance Considerations

- Spiral path generation: O(n²) one-time cost on game init
- Question selection: O(q) where q = total questions (negligible for <1000 questions)
- State updates: Immutable patterns in Zustand minimize re-renders
- No optimization needed until measured per constitution
