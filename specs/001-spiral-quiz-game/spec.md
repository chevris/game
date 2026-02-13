# Feature Specification: Spiral Quiz Game

**Feature Branch**: `001-spiral-quiz-game`  
**Created**: 2026-02-12  
**Status**: Draft  
**Input**: User description: "Build an MVP web-based multiplayer turn-based game with spiral board and German history quiz questions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Player Game Flow (Priority: P1)

A single player can start a game, answer questions, roll dice, and win by reaching the center of the spiral board.

**Why this priority**: Core game loop must work for one player before adding multiplayer complexity. Validates all fundamental mechanics: board generation, question system, dice rolling, movement, and win condition.

**Independent Test**: Can be fully tested by starting a 1-player game, answering questions correctly/incorrectly, observing movement along the spiral path, and reaching the center to trigger win state.

**Acceptance Scenarios**:

1. **Given** game is initialized with 1 player, **When** player starts the game, **Then** player sees an 11x11 spiral board with their token at the starting position (top-left corner)
2. **Given** it's player's turn, **When** turn begins, **Then** system displays a German history/geography question with 3 answer choices (A, B, C) and reads it aloud
3. **Given** question is displayed, **When** player says "B" or clicks button B, **Then** system validates answer and either allows dice roll (correct) or ends turn (incorrect)
4. **Given** player answered correctly, **When** player rolls dice, **Then** token moves N cells along spiral path where N is the die result (1-6)
5. **Given** player's new position, **When** position index equals or exceeds center cell index, **Then** game displays victory message and stops

---

### User Story 2 - Multiple Players Taking Turns (Priority: P2)

2-4 players can participate in the same game, taking turns sequentially, with each player maintaining their own position on the board.

**Why this priority**: Multiplayer is mentioned as part of MVP, but the turn-taking logic depends on having a working single-player foundation.

**Independent Test**: Can be tested by starting a game with 2-4 players, verifying each player takes turns in order, tracking separate positions, and ensuring only one player can win.

**Acceptance Scenarios**:

1. **Given** game setup screen, **When** user selects 2-4 players, **Then** system initializes game with all players starting at position 0 (top-left)
2. **Given** multiple players in game, **When** a turn completes, **Then** system advances to next player in sequence (wrapping back to player 1 after last player)
3. **Given** it's player 2's turn, **When** player 2 answers and moves, **Then** only player 2's token position updates
4. **Given** player 3 reaches center, **When** win condition triggers, **Then** game stops immediately and declares player 3 as winner (other players don't get another turn)

---

### User Story 3 - Voice Recognition for Answers (Priority: P3)

Players can answer questions using voice commands ("A", "B", or "C") instead of clicking buttons, with graceful fallback to button clicks.

**Why this priority**: Voice is a nice-to-have enhancement but not essential for core gameplay. Buttons provide full functionality without voice.

**Independent Test**: Can be tested by granting microphone permission, speaking "A"/"B"/"C" during question phase, and verifying answer is captured. Also test denying permission to verify button fallback works.

**Acceptance Scenarios**:

1. **Given** question is displayed and microphone permission granted, **When** player says "B", **Then** system recognizes speech and submits answer B
2. **Given** voice recognition is active, **When** player says unrecognized word, **Then** system ignores input and waits for valid "A", "B", or "C"
3. **Given** microphone permission denied or voice fails, **When** question appears, **Then** system displays clickable buttons A/B/C as fallback
4. **Given** voice recognition timeout (10 seconds with no input), **When** timeout occurs, **Then** system prompts player to use buttons

---

### User Story 4 - Dynamic Difficulty Scaling (Priority: P4)

Questions become progressively harder as players advance deeper into the spiral, with difficulty determined by position index ranges.

**Why this priority**: Adds strategic depth and educational value, but game is playable with random questions. Can be added after core mechanics work.

**Independent Test**: Can be tested by manually advancing a player through different spiral positions and verifying question difficulty level increases at defined thresholds.

**Acceptance Scenarios** (for default 11×11 board with 121 cells):

1. **Given** player at positions 0-17% (spiral indices 0-20), **When** question is presented, **Then** question difficulty level is 1
2. **Given** player at positions 18-41% (spiral indices 21-50), **When** question is presented, **Then** question difficulty level is 2
3. **Given** player at positions 42-66% (spiral indices 51-80), **When** question is presented, **Then** question difficulty level is 3
4. **Given** player at positions 67-83% (spiral indices 81-100), **When** question is presented, **Then** question difficulty level is 4
5. **Given** player at positions 84-100% (spiral indices 101-120), **When** question is presented, **Then** question difficulty level is 5

**Note**: Difficulty calculation uses percentage-based formula `difficulty = f(position / totalCells)` to scale across any board size. See [research.md](research.md) for implementation algorithm.

---

### User Story 5 - Unique Question Distribution (Priority: P4)

Each player receives unique questions throughout the game (no repeats for same player, no identical questions for players on same cell).

**Why this priority**: Prevents memorization exploits and ensures fair competition, but game is functional without this constraint initially.

**Independent Test**: Can be tested by tracking question IDs presented to each player and verifying no duplicates within a player's history and no matches between players on the same cell during the same turn.

**Acceptance Scenarios**:

1. **Given** player has answered question ID 42, **When** system selects next question for that player, **Then** question ID 42 is excluded from selection pool
2. **Given** two players on same cell (index 30), **When** both players receive questions in consecutive turns, **Then** they receive different question IDs
3. **Given** question pool for difficulty level is exhausted, **When** system needs a question, **Then** system selects from next available difficulty level and logs a warning

---

### Edge Cases

- What happens when a player rolls a 6 but is only 3 cells from the center? (Answer: Player moves 3 cells and wins; extra movement is ignored)
- How does system handle multiple players landing on the same cell? (Answer: Allowed; positions are independent, visual stacking is UI concern)
- What happens when voice recognition is not supported by browser? (Answer: System detects lack of Web Speech API support and defaults to button-only interface)
- What happens if all questions at current difficulty are already used? (Answer: System escalates to next difficulty level or wraps to lower difficulty if at max)
- How does system handle player disconnecting mid-game in multiplayer? (Answer: For MVP in-memory state, game continues without that player; no reconnection support)
- What happens when board size parameter is even (e.g., 10x10)? (Answer: System validation rejects even numbers and prompts for odd number, or defaults to nearest odd number like 11)
- What happens when only 1 player joins a "2-4 player" game? (Answer: Game proceeds as single-player; no minimum player enforcement for MVP)
- How does system handle extremely fast speech input (player says "A" twice)? (Answer: Recognition locks after first valid input until next question)

## Requirements *(mandatory)*

### Functional Requirements

#### Core Game Mechanics

- **FR-001**: System MUST generate a square spiral board with odd dimensions (default 11x11)
- **FR-002**: System MUST validate that board size is always an odd number
- **FR-003**: System MUST generate spiral path algorithmically starting from top-left corner and ending at center cell, following a clockwise pattern (right → down → left → up, spiraling inward)
- **FR-004**: System MUST ensure spiral path covers every cell exactly once using orthogonal movement only (no diagonals)
- **FR-005**: System MUST support 1 to 4 players in a game session
- **FR-006**: System MUST initialize all players at position index 0 (top-left corner of spiral). Player token MUST visually move along the spiral path with smooth CSS transitions completing within 500ms for visual clarity.
- **FR-007**: System MUST enforce sequential turn-taking (player 1 → player 2 → player 3 → player 4 → player 1...)

#### Question System

- **FR-008**: System MUST load questions from a local JSON file at game initialization
- **FR-008a**: Questions JSON file MUST be an array of objects, each containing: `id` (unique number), `text` (question string), `answers` (array of exactly 3 strings), `correct` (string: "A", "B", or "C"), `difficulty` (number: 1-5), `category` (string: "history" or "geography")
- **FR-009**: Each question MUST have exactly 3 possible answers labeled A, B, and C
- **FR-010**: Questions MUST focus on German history and geography topics
- **FR-011**: Questions MUST be categorized by difficulty levels 1 through 5
- **FR-012**: System MUST select questions based on player's current spiral index position using percentage-based thresholds: 0-17% → L1, 18-41% → L2, 42-66% → L3, 67-83% → L4, 84-100% → L5 (see [research.md](research.md) for difficulty mapping formula)
- **FR-013**: System MUST track which questions each player has already seen
- **FR-014**: System MUST NOT present the same question to a player twice in the same game session
- **FR-015**: System MUST NOT present identical questions to multiple players occupying the same cell during the same turn cycle

#### Turn Flow

- **FR-016**: At turn start, system MUST display one question appropriate to current player's position
- **FR-017**: System MUST read the question aloud using browser's SpeechSynthesis API with German (de-DE) language voice
- **FR-018**: System MUST wait for player to submit answer (via voice or button click)
- **FR-019**: System MUST validate the submitted answer against correct answer
- **FR-020**: If answer is correct, system MUST allow player to roll a 6-sided die
- **FR-021**: If answer is incorrect, system MUST immediately end the turn and advance to next player
- **FR-022**: After correct answer, system MUST simulate a die roll producing random value 1-6
- **FR-023**: System MUST move player's token along spiral path by the number of cells equal to die result
- **FR-024**: System MUST update player's position index (not coordinates, but index in spiral array)
- **FR-025**: System MUST check win condition after each movement

#### Win Condition

- **FR-026**: System MUST declare a player as winner when their position index equals or exceeds the center cell index
- **FR-027**: System MUST stop the game immediately when a player wins (no additional turns)
- **FR-028**: System MUST display victory message showing which player won

#### Voice Recognition

- **FR-029**: System MUST use browser's native Web Speech API (SpeechRecognition) for voice input
- **FR-030**: System MUST configure recognition to accept only single-character inputs: "A", "B", or "C"
- **FR-031**: System MUST request microphone permission from user before enabling voice input
- **FR-032**: System MUST handle microphone permission denial by disabling voice and showing button fallback
- **FR-033**: System MUST implement timeout (10 seconds) for voice recognition; after timeout, prompt for button input
- **FR-034**: System MUST provide clickable button fallback for A/B/C answers at all times
- **FR-035**: System MUST handle browsers that don't support Web Speech API by defaulting to button-only mode

#### Data and State Management

- **FR-036**: System MUST use Zustand for global state management (game state, player positions, turn order, question history)
- **FR-037**: System MUST maintain all game state in memory only (no database or persistent storage)
- **FR-038**: System MUST separate pure game logic (spiral generation, movement calculations, win detection) from UI components
- **FR-039**: System MUST store questions in a static JSON file located in the public assets directory

### Key Entities

- **Game Session**: Represents an active game; contains board configuration (size, spiral path array), list of players, current turn index, game status (in-progress, completed), winner information
- **Player**: Represents a participant; contains player ID (1-4), current position index in spiral path, list of answered question IDs, correct answer count, incorrect answer count
- **Spiral Board**: Represents the game board; contains grid dimensions (e.g., 11x11), ordered array of cell coordinates forming clockwise spiral path from top-left to center, center cell index
- **Question**: Represents a quiz item; contains unique question ID, question text, array of 3 answer options, correct answer indicator (A/B/C), difficulty level (1-5), topic category (history/geography)
- **Turn**: Represents a player's action sequence; contains current player ID, presented question, player's submitted answer, answer correctness, die roll result (if applicable), starting position, ending position

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete a full single-player game from start to victory in under 5 minutes (assuming correct answers)
- **SC-002**: System loads and renders an 11x11 spiral board with all 121 cells visible within 2 seconds of game start
- **SC-003**: Voice recognition correctly identifies "A", "B", or "C" commands with at least 85% accuracy in a quiet environment
- **SC-004**: Question text is read aloud within 1 second of being displayed on screen
- **SC-005**: 100% of questions presented to a single player are unique throughout one game session
- **SC-006**: Game state updates (die roll, movement animation, turn transition) are visually smooth and complete within 1 second per action
- **SC-007**: System correctly handles 4 simultaneous players taking turns without state conflicts or position errors
- **SC-008**: At least 90% of test players can understand the game rules and complete a full game without external help
- **SC-009**: Spiral path generation algorithm produces valid path (all cells visited exactly once) for any odd board size between 5x5 and 21x21
- **SC-010**: System gracefully degrades to button-only input when Web Speech API is unavailable, maintaining full playability

## Assumptions

- **A-001**: Players have access to a modern web browser supporting ES6+ JavaScript (Chrome, Firefox, Edge, Safari)
- **A-002**: For voice recognition, players are in a reasonably quiet environment (Web Speech API accuracy degrades with background noise)
- **A-003**: Players understand basic German or are using the game as a learning tool (questions are not translated)
- **A-004**: Questions JSON file will be manually curated and provided; no question authoring UI is needed for MVP
- **A-005**: For MVP, multiplayer means "hot-seat" local play (all players share one device); network multiplayer is explicitly out of scope
- **A-006**: Spiral path difficulty thresholds are hardcoded based on 11x11 board (121 cells); dynamic scaling for other board sizes is not required
- **A-007**: Visual design (colors, fonts, animations) will be minimal/functional; polished UI is not part of MVP scope
- **A-008**: Browser must support Web Speech API for voice features; no polyfill or server-side speech recognition is provided
- **A-009**: Game sessions are ephemeral; refreshing the browser resets the game (no save/load functionality)
- **A-010**: Question difficulty levels 1-5 are defined in the JSON file; no runtime difficulty adjustment logic beyond position-based selection

## Clarifications

### Session 2026-02-12

- Q: Which spiral direction should the game use (clockwise, counter-clockwise, or alternating)? → A: Clockwise spiral (right → down → left → up, inward)
- Q: What schema should the questions JSON file follow? → A: Array of objects with id, text, answers, correct, difficulty, category
- Q: What language/voice should SpeechSynthesis use when reading questions aloud? → A: German (de-DE) voice
