---
description: "Task list for Spiral Quiz Game implementation"
---

# Tasks: Spiral Quiz Game

**Input**: Design documents from `/specs/001-spiral-quiz-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks included (per constitution - no testing infrastructure required)

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- All paths shown are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure

- [ ] T001 Install Zustand dependency via `npm install zustand`
- [ ] T002 Create folder structure: `src/components/`, `src/store/`, `src/engine/`, `src/hooks/`, `src/utils/`, `public/data/`
- [ ] T003 [P] Copy sample questions from `specs/001-spiral-quiz-game/contracts/questions-sample.json` to `public/data/questions.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core game engine and state management that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Implement spiral path generator in `src/engine/spiralGenerator.js` with `generateSpiral(size)` function returning clockwise path array
- [ ] T005 [P] Implement center index calculator in `src/engine/spiralGenerator.js` with `getCenterIndex(size)` function
- [ ] T006 [P] Implement movement engine in `src/engine/movementEngine.js` with `movePlayer(currentIndex, diceRoll, centerIndex)` function
- [ ] T007 [P] Implement victory checker in `src/engine/victoryChecker.js` with `checkWin(position, centerIndex)` function
- [ ] T008 [P] Implement difficulty mapper in `src/engine/difficultyMapper.js` with `getDifficulty(position, totalCells)` returning levels 1-5
- [ ] T009 [P] Implement question selector in `src/engine/questionSelector.js` with `selectQuestion(questions, difficulty, playerUsedIds, otherPlayersIds)` function
- [ ] T010 [P] Implement helper in `src/engine/questionSelector.js` with `getOtherPlayersQuestions(players, currentPlayerId, currentPosition)` function
- [ ] T011 Create Zustand store in `src/store/gameStore.js` with initial state structure (boardSize, spiralPath, centerIndex, gameStatus, players, questions, currentQuestion)
- [ ] T012 Implement `initializeGame(playerCount, boardSize)` action in `src/store/gameStore.js`
- [ ] T013 Implement `loadQuestions()` action in `src/store/gameStore.js` to fetch from `/data/questions.json`
- [ ] T014 Implement `presentQuestion()` action in `src/store/gameStore.js` using difficulty mapping and question selection logic
- [ ] T015 Implement `submitAnswer(answer)` action in `src/store/gameStore.js` with answer validation
- [ ] T016 Implement `rollDice()` action in `src/store/gameStore.js` generating random 1-6
- [ ] T017 Implement `moveCurrentPlayer(steps)` action in `src/store/gameStore.js` updating player position and checking win condition
- [ ] T018 Implement `nextTurn()` action in `src/store/gameStore.js` advancing turn index and presenting next question
- [ ] T019 Implement `resetGame()` action in `src/store/gameStore.js` resetting to setup state

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single Player Game Flow (Priority: P1) 🎯 MVP

**Goal**: Single player can start game, answer questions, roll dice, move along spiral, and win by reaching center

**Independent Test**: Start 1-player game, answer questions (mix of correct/incorrect), observe movement, reach center to trigger victory

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create GameSetup component in `src/components/GameSetup.jsx` with player count selector (1-4) and start button
- [ ] T020a [P] [US1] Add board size selector to `src/components/GameSetup.jsx` with dropdown for odd sizes (5, 7, 9, 11, 13, 15, 17, 19, 21) defaulting to 11, validation to reject even numbers (SC-004)
- [ ] T021 [P] [US1] Create GameBoard component in `src/components/GameBoard.jsx` rendering grid with CSS Grid layout based on spiralPath
- [ ] T022 [P] [US1] Add player token visualization in `src/components/GameBoard.jsx` showing colored circles at player positions
- [ ] T023 [P] [US1] Create QuestionPanel component in `src/components/QuestionPanel.jsx` displaying question text and three answer buttons (A, B, C)
- [ ] T024 [US1] Add answer validation feedback in `src/components/QuestionPanel.jsx` showing correct/incorrect after submission
- [ ] T025 [P] [US1] Create DiceRoller component in `src/components/DiceRoller.jsx` with roll button (only enabled after correct answer)
- [ ] T026 [US1] Add dice animation in `src/components/DiceRoller.jsx` displaying random number 1-6
- [ ] T027 [P] [US1] Create WinScreen component in `src/components/WinScreen.jsx` displaying victory message and restart button
- [ ] T028 [US1] Wire components in `src/App.jsx` with conditional rendering based on gameStatus (setup/playing/finished)
- [ ] T029 [US1] Add useEffect in `src/App.jsx` to load questions on mount via `loadQuestions()` action
- [ ] T030 [US1] Add basic CSS styling in `src/index.css` for board grid, buttons, and layout (two-column: board left, controls right)

**Checkpoint**: User Story 1 complete - single player game fully functional and independently testable

---

## Phase 4: User Story 2 - Multiple Players Taking Turns (Priority: P2)

**Goal**: 2-4 players can participate, take sequential turns, maintain separate positions, and compete for victory

**Independent Test**: Start 2-4 player game, verify turn rotation, check position independence, ensure only first to center wins

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create TurnIndicator component in `src/components/TurnIndicator.jsx` displaying current player ID and color
- [ ] T032 [US2] Update GameBoard in `src/components/GameBoard.jsx` to handle multiple player tokens on same cell (visual stacking)
- [ ] T033 [US2] Add turn transition delay in `src/store/gameStore.js` actions (1.5s between turns for visual clarity)
- [ ] T034 [US2] Update WinScreen in `src/components/WinScreen.jsx` to display which player (1-4) won
- [ ] T035 [US2] Add player statistics display in `src/components/TurnIndicator.jsx` showing correctCount and incorrectCount per player
- [ ] T036 [US2] Update CSS in `src/index.css` for multi-player UI (distinct colors: red, blue, green, yellow)

**Checkpoint**: User Story 2 complete - multiplayer turn-taking works independently, builds on US1 foundation

---

## Phase 5: User Story 3 - Voice Recognition for Answers (Priority: P3)

**Goal**: Players can answer using voice commands ("A", "B", "C") with graceful fallback to buttons

**Independent Test**: Grant mic permission, speak answers, verify recognition; deny permission, verify button fallback works

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create useSpeechSynthesis hook in `src/hooks/useSpeechSynthesis.js` using browser SpeechSynthesis API for German (de-DE) voice
- [ ] T038 [P] [US3] Create useSpeechRecognition hook in `src/hooks/useSpeechRecognition.js` using SpeechRecognition API filtering for A/B/C only
- [ ] T039 [US3] Add 10-second timeout handling in `src/hooks/useSpeechRecognition.js` with cleanup on unmount
- [ ] T040 [US3] Integrate useSpeechSynthesis in `src/components/QuestionPanel.jsx` to read question aloud when displayed
- [ ] T041 [US3] Integrate useSpeechRecognition in `src/components/QuestionPanel.jsx` to capture voice answers
- [ ] T042 [US3] Add browser support detection in `src/components/QuestionPanel.jsx` displaying "Voice not supported" message when Web Speech API unavailable
- [ ] T043 [US3] Add microphone permission error handling in `src/hooks/useSpeechRecognition.js` gracefully falling back to buttons

**Checkpoint**: User Story 3 complete - voice input works as enhancement, game remains fully playable without it

---

## Phase 6: User Story 4 - Dynamic Difficulty Scaling (Priority: P4)

**Goal**: Questions become progressively harder as players advance along spiral path

**Independent Test**: Manually advance player through positions, verify difficulty levels increase at defined thresholds (index ranges)

### Implementation for User Story 4

- [ ] T044 [US4] Verify difficulty thresholds in `src/engine/difficultyMapper.js` match spec requirements (0-17%: L1, 18-41%: L2, 42-66%: L3, 67-83%: L4, 84-100%: L5)
- [ ] T045 [US4] Add difficulty level indicator in `src/components/QuestionPanel.jsx` displaying current question difficulty (1-5 stars or number)
- [ ] T046 [US4] Validate questions.json has balanced distribution across 5 difficulty levels (minimum 10 per level recommended)

**Checkpoint**: User Story 4 complete - difficulty scales with progress, adds strategic depth

---

## Phase 7: User Story 5 - Unique Question Distribution (Priority: P4)

**Goal**: Each player receives unique questions (no repeats), players on same cell get different questions

**Independent Test**: Track question IDs per player, verify no duplicates; place multiple players on same cell, verify different questions

### Implementation for User Story 5

- [ ] T047 [US5] Verify question exclusion logic in `src/engine/questionSelector.js` correctly filters by playerUsedIds
- [ ] T048 [US5] Verify same-cell exclusion in `src/engine/questionSelector.js` using getOtherPlayersQuestions helper
- [ ] T049 [US5] Add fallback to next difficulty level in `src/engine/questionSelector.js` when question pool exhausted
- [ ] T050 [US5] Add console warning in `src/engine/questionSelector.js` when no questions available for current difficulty
- [ ] T051 [US5] Update presentQuestion action in `src/store/gameStore.js` to correctly pass otherPlayersOnCellIds to selectQuestion

**Checkpoint**: User Story 5 complete - fair question distribution prevents memorization exploits

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, final integration, visual polish

- [ ] T052 [P] Handle edge case: player rolls beyond center in `src/engine/movementEngine.js` (clamp to centerIndex, trigger win)
- [ ] T053 [P] Handle edge case: even board size validation in `src/engine/spiralGenerator.js` (throw error or convert to nearest odd)
- [ ] T054 [P] Handle edge case: speech recognition double-input in `src/hooks/useSpeechRecognition.js` (lock after first valid A/B/C)
- [ ] T055 Add move animation in `src/components/GameBoard.jsx` using CSS transitions for token movement
- [ ] T056 Add dice roll animation in `src/components/DiceRoller.jsx` with random number cycling effect
- [ ] T057 Improve responsive layout in `src/index.css` for mobile/tablet screens (stack board and controls vertically on small screens)
- [ ] T058 Add game restart functionality in `src/components/WinScreen.jsx` calling resetGame action
- [ ] T059 Add constants file in `src/utils/constants.js` for magic numbers (MAX_PLAYERS=4, DEFAULT_BOARD_SIZE=11, DICE_SIDES=6, etc.)
- [ ] T060 Validate constitution compliance: no localStorage, no backend calls, no TypeScript, pure JS separation in engine/

---

## Dependencies

### User Story Completion Order

```
Setup (Phase 1)
  ↓
Foundational (Phase 2) ← MUST complete first
  ↓
├─→ US1 (Phase 3) ← Start here (MVP baseline)
├─→ US2 (Phase 4) ← Depends on US1 (adds multiplayer to working game)
├─→ US3 (Phase 5) ← Independent (enhances US1 with voice, can develop in parallel with US2)
├─→ US4 (Phase 6) ← Independent (enhances question selection, minimal new code)
└─→ US5 (Phase 7) ← Independent (refines question selection, minimal new code)
  ↓
Polish (Phase 8) ← After all user stories complete
```

### Critical Path
```
Setup → Foundational → US1 → US2 → Polish
```

**Suggested MVP**: Complete through Phase 4 (US1 + US2) for minimal viable multiplayer game. US3-US5 are enhancements.

---

## Parallel Execution Examples

### Phase 2 - Foundational (Maximum Parallelization)
Tasks T004-T010 can all run in parallel (different engine files, pure functions, no dependencies)

**Team Assignment**:
- Developer 1: T004, T005 (spiralGenerator.js)
- Developer 2: T006, T007 (movementEngine.js, victoryChecker.js)
- Developer 3: T008, T009, T010 (difficultyMapper.js, questionSelector.js)
- Developer 4: T011-T019 (gameStore.js - sequential within this file)

### Phase 3 - User Story 1 (UI Components)
Tasks T020-T023, T025, T027 can run in parallel (different component files)

**Team Assignment**:
- Developer 1: T020 (GameSetup.jsx)
- Developer 2: T021, T022 (GameBoard.jsx)
- Developer 3: T023, T024 (QuestionPanel.jsx)
- Developer 4: T025, T026 (DiceRoller.jsx), T027 (WinScreen.jsx)

Then T028-T030 wire everything together (sequential)

### Phase 5 - User Story 3 (Hooks)
Tasks T037, T038 can run in parallel (separate hook files)

### Phase 8 - Polish
Tasks T052-T054, T059 can run in parallel (independent edge cases and utilities)

---

## Implementation Strategy

### MVP-First Approach (Recommended)

**Sprint 1** (Week 1):
- Phase 1: Setup (T001-T003)
- Phase 2: Foundational (T004-T019)
- Phase 3: US1 baseline (T020-T030)

**Sprint 2** (Week 2):
- Phase 4: US2 multiplayer (T031-T036)
- Phase 8: Critical polish (T052-T054, T058-T060)

**Sprint 3** (Week 3 - Optional):
- Phase 5: US3 voice (T037-T043)
- Phase 6: US4 difficulty (T044-T046)
- Phase 7: US5 uniqueness (T047-T051)
- Phase 8: Final polish (T055-T057)

### Incremental Delivery

After each phase completion, you have a working, demonstrable product:
- **Post-Phase 3**: Single-player game (fully playable MVP)
- **Post-Phase 4**: Multiplayer game (complete core experience)
- **Post-Phase 5**: Voice-enhanced game (accessibility feature)
- **Post-Phase 6**: Difficulty-scaled game (educational depth)
- **Post-Phase 7**: Fair-question game (competitive integrity)

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 16 tasks
- **Phase 3 (US1)**: 11 tasks
- **Phase 4 (US2)**: 6 tasks
- **Phase 5 (US3)**: 7 tasks
- **Phase 6 (US4)**: 3 tasks
- **Phase 7 (US5)**: 5 tasks
- **Phase 8 (Polish)**: 9 tasks

**Total**: 60 tasks

**Parallelizable**: 20 tasks marked with [P]

**MVP Scope (US1 + US2)**: 36 tasks (Phases 1-4 + critical polish)

---

## Validation Checklist

Before marking feature complete:

- [ ] All 5 user stories independently testable and passing manual tests
- [ ] Constitution compliance verified (no violations introduced)
- [ ] Spiral path generates correctly for odd board sizes 5-21
- [ ] Questions loaded from JSON and selectable across all 5 difficulty levels
- [ ] Voice recognition works in Chrome/Edge with graceful fallback
- [ ] Multiple players can complete full game without state conflicts
- [ ] Win condition correctly stops game when center reached
- [ ] No persistence mechanisms introduced (refresh = reset)
- [ ] Code readable by junior developers (per constitution)
- [ ] Game logic separated from UI (engine/ vs components/)
