# Research: Spiral Quiz Game

**Date**: 2026-02-13  
**Purpose**: Resolve technical unknowns and document best practices for implementation

## Overview

All core technologies are specified in the constitution and feature spec. This research focuses on best practices for the key technical challenges: spiral path generation algorithm, Web Speech API integration, and Zustand state patterns.

## Research Areas

### 1. Spiral Path Generation Algorithm

**Decision**: Clockwise inward spiral using layer-by-layer traversal

**Rationale**: 
- Start at top-left (0, 0) position in grid
- Move right along top edge until hitting boundary or visited cell
- Turn 90° clockwise (down), continue until boundary/visited
- Repeat turning clockwise (left, then up, then right again) until center reached
- Time complexity O(n²) for n×n grid, space O(n²) for storing path

**Algorithm Pattern** (pseudocode):
```javascript
function generateSpiral(size) {
  const grid = Array(size).fill().map(() => Array(size).fill(false));
  const path = [];
  let x = 0, y = 0;
  let dx = 1, dy = 0; // Start moving right
  
  for (let i = 0; i < size * size; i++) {
    path.push({ x, y });
    grid[y][x] = true;
    
    // Try to continue in current direction
    const nx = x + dx, ny = y + dy;
    
    // If hit boundary or visited, turn clockwise
    if (nx < 0 || nx >= size || ny < 0 || ny >= size || grid[ny][nx]) {
      [dx, dy] = [-dy, dx]; // Rotate 90° clockwise
    }
    
    x += dx;
    y += dy;
  }
  
  return path;
}
```

**Alternatives Considered**:
- Recursive approach: More complex, harder to debug
- Mathematical formula: Less readable, doesn't handle arbitrary sizes well

**Validation**: Center cell for 11×11 grid is index 60 (path[60] = {x: 5, y: 5})

---

### 2. Web Speech API Integration

**Decision**: Use native `SpeechSynthesis` and `SpeechRecognition` APIs with feature detection

**Text-to-Speech (SpeechSynthesis)**:
```javascript
function speakGerman(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('TTS not supported');
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9; // Slightly slower for clarity
  
  // Try to find a German voice
  const voices = speechSynthesis.getVoices();
  const germanVoice = voices.find(v => v.lang.startsWith('de'));
  if (germanVoice) utterance.voice = germanVoice;
  
  speechSynthesis.speak(utterance);
}
```

**Voice Recognition (SpeechRecognition)**:
```javascript
function useVoiceRecognition(onResult) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return { supported: false, start: () => {} };
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'de-DE'; // Recognize German (or 'en-US' for A/B/C)
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toUpperCase().trim();
    if (['A', 'B', 'C'].includes(transcript)) {
      onResult(transcript);
    }
  };
  
  return { supported: true, start: () => recognition.start() };
}
```

**Rationale**:
- No polyfills needed (graceful degradation to buttons)
- Chrome/Edge support excellent, Firefox partial, Safari requires webkit prefix
- Timeout handled via `setTimeout` wrapper in React hook

**Alternatives Considered**:
- Third-party TTS library: Adds bundle size, constitution forbids unnecessary deps
- Server-side speech API: Violates no-backend principle

---

### 3. Zustand State Management Patterns

**Decision**: Single store with slices for game, players, and questions

**Store Structure**:
```javascript
const useGameStore = create((set, get) => ({
  // Game state
  boardSize: 11,
  spiralPath: [],
  centerIndex: 60,
  gameStatus: 'setup', // 'setup' | 'playing' | 'finished'
  currentTurnIndex: 0,
  winner: null,
  
  // Players state
  players: [], // [{ id, position, answeredQuestions, stats }]
  
  // Questions state
  questions: [],
  currentQuestion: null,
  
  // Actions
  initializeGame: (playerCount, boardSize) => set((state) => ({
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      position: 0,
      answeredQuestions: [],
      correctCount: 0,
      incorrectCount: 0
    })),
    boardSize,
    spiralPath: generateSpiral(boardSize),
    centerIndex: Math.floor((boardSize * boardSize) / 2),
    gameStatus: 'playing',
    currentTurnIndex: 0
  })),
  
  nextTurn: () => set((state) => ({
    currentTurnIndex: (state.currentTurnIndex + 1) % state.players.length,
    currentQuestion: null
  })),
  
  // ... more actions
}));
```

**Rationale**:
- Single source of truth, no prop drilling
- Actions colocated with state
- No Redux boilerplate (no reducers, action types, middleware)
- DevTools support via `devtools` middleware (optional)

**Alternatives Considered**:
- Context API: Re-render performance issues with frequent updates
- Multiple stores: Unnecessarily complex for small app

---

### 4. Difficulty Mapping Based on Position

**Decision**: Map position percentage to difficulty levels 1-5 using thresholds

**Implementation**:
```javascript
function getDifficulty(currentPosition, totalCells) {
  const progress = currentPosition / totalCells;
  
  if (progress < 0.17) return 1;      // 0-20 cells (outer ring)
  if (progress < 0.41) return 2;      // 21-50
  if (progress < 0.66) return 3;      // 51-80
  if (progress < 0.83) return 4;      // 81-100
  return 5;                           // 101+ (approaching center)
}
```

**Rationale**: Percentages scale to any board size; thresholds match spec (FR-012, US4)

---

### 5. Question Selection Logic

**Decision**: Filter by difficulty, exclude used questions, avoid duplicates for same-cell players

**Implementation Pattern**:
```javascript
function selectQuestion(questions, difficulty, playerUsedIds, otherPlayersOnCellIds) {
  const excludedIds = new Set([...playerUsedIds, ...otherPlayersOnCellIds]);
  
  const available = questions.filter(q => 
    q.difficulty === difficulty && !excludedIds.has(q.id)
  );
  
  if (available.length === 0) {
    // Fallback: try next difficulty level
    const fallback = questions.filter(q => 
      q.difficulty === difficulty + 1 && !excludedIds.has(q.id)
    );
    return fallback[Math.floor(Math.random() * fallback.length)] || null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
}
```

**Rationale**: Satisfies FR-014 (no repeats per player) and FR-015 (no same question for players on same cell)

---

## Implementation Sequence

Based on user-provided phases and technical research:

1. **Phase 1 - Project Setup**: Initialize Zustand, create folder structure
2. **Phase 2 - Core Engine**: Implement spiral generator, movement, difficulty mapping
3. **Phase 3 - State Management**: Build Zustand store with all game actions
4. **Phase 4 - Question System**: Create JSON schema, implement question selector
5. **Phase 5 - Voice Integration**: Build custom hooks for TTS and voice recognition
6. **Phase 6 - UI Layer**: React components for board, questions, dice, turn indicator
7. **Phase 7 - Game Flow Wiring**: Connect all pieces in App.jsx
8. **Phase 8 - Edge Cases**: Handle edge cases identified in spec

## Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Web Speech API browser support varies | High | Medium | Feature detection + button fallback (FR-034) |
| German voice not available on all systems | Medium | Low | Fallback to any available voice with de-DE lang setting |
| Spiral algorithm produces incorrect path | Low | High | Validate center index calculation, manual path inspection |
| Question pool exhaustion | Low | Medium | Escalate to next difficulty level (edge case documented) |

## References

- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Zustand Documentation: https://github.com/pmndrs/zustand
- Spiral Matrix Algorithm: Classic CS problem, well-documented pattern
