# Tasks: UI Redesign & German Localization

**Feature**: `002-ui-redesign-german`  
**Branch**: `002-ui-redesign-german`  
**Created**: 2026-02-26  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Implementation Strategy

**MVP scope**: User Story 1 (German start screen + character cards) alone delivers a playable, fully demonstrable increment. Each subsequent story adds an independently testable layer on top.

**Delivery order**: Setup → Foundational → US1 → US2 → US3 → US4 → Polish  
Each phase produces a working app snapshot; no phase leaves the codebase broken.

---

## Phase 1 — Setup

> Initialize new files and remove deleted code so the project compiles cleanly.

- [x] T001 Delete `src/hooks/useSpeechRecognition.js` (remove voice recognition source file)
- [x] T002 Create `src/data/characters.js` with 3 CharacterDef entries (Marie Curie id=0 #e63946, Rosa Parks id=1 #2a9d8f, Malala Yousafzai id=2 #e9c46a), each with German bio text
- [x] T003 Create `src/engine/tileColorMapper.js` exporting `getTileColorLevel(position, totalCells)` returning 1 when `position/totalCells < 0.50`, 2 when < 0.85, else 3
- [x] T004 [P] Create SVG portrait placeholder `public/images/marie-curie.svg` (simple labeled silhouette SVG)
- [x] T005 [P] Create SVG portrait placeholder `public/images/rosa-parks.svg`
- [x] T006 [P] Create SVG portrait placeholder `public/images/malala-yousafzai.svg`

---

## Phase 2 — Foundational

> Update shared constants and the Zustand store so all subsequent feature phases have correct data contracts. Must complete before any US phase.

- [x] T007 Update `src/utils/constants.js`: set `MAX_PLAYERS = 3`, `MAX_BOARD_SIZE = 11`, remove `VOICE_RECOGNITION_TIMEOUT` export
- [x] T008 Update `src/store/gameStore.js` — change `initializeGame(playerCount, boardSize)` to `initializeGame(selectedIndices, boardSize = 11)`: import `characters` from `../data/characters`, build `players` array from `selectedIndices.map((charId, i) => ({ id: i+1, position: 0, answeredQuestions: [], correctCount: 0, incorrectCount: 0, color: characters[charId].playerColor, name: characters[charId].name, characterId: charId }))`, remove boardSize param from the call site default to always 11

---

## Phase 3 — User Story 1: German-Language Start Screen (P1)

**Story goal**: Player opens the app, sees "Der Weg zur Gleichheit", reads German rules, selects 1–3 character cards (Marie Curie / Rosa Parks / Malala Yousafzai) via cards with ⓘ bio overlays, then clicks "Spiel starten".

**Independent test**: Load the app without starting a game. Verify: title text, rules text, 3 cards render with portrait images and names, ⓘ button opens bio overlay, "Spiel starten" is disabled until ≥1 card is selected, 4th card cannot be selected.

- [x] T009 [US1] Create `src/components/CharacterCard.jsx`: props `{ character, selected, onSelect }`; renders a `<div className="character-card">` containing `<img src={character.imageSrc} alt={character.name}>`, `<p className="card-name">{character.name}</p>`, `<button className="info-btn" onClick={toggleBio}>ⓘ</button>`, and a conditional `<div className="bio-overlay">` with close button and `{character.bio}` text; `selected` prop adds class `selected` to the card; clicking the card (not the ⓘ button) calls `onSelect`
- [x] T010 [US1] Create `src/components/CharacterCard.css`: `.character-card` with border, cursor pointer, relative positioning, transition on border-color; `.character-card.selected` with highlighted border (2px solid #e63946 or similar accent); `.info-btn` positioned top-right absolute; `.bio-overlay` positioned absolute, full-card overlay with semi-transparent background, bio text centered, close button; responsive card width ~200px
- [x] T011 [US1] Rewrite `src/components/GameSetup.jsx`: remove `playerCount` dropdown and `boardSize` picker; add `selectedIndices` local state (array, max length 3); render `<h1>Der Weg zur Gleichheit</h1>`, `<p className="game-rules">Sei der Erste, der das Ziel erreicht, indem du Fragen zur Geschichte der Frauen weltweit richtig beantwortest. Aber Vorsicht: 'Manche Fragen sind kniffliger als andere!'</p>`, `<p className="select-hint">Wähle 1 bis 3 Spielerinnen:</p>`, a `<div className="cards-row">` containing 3 `<CharacterCard>` components, and `<button className="start-button" disabled={selectedIndices.length === 0}>Spiel starten</button>`; `onSelect` handler toggles index in array (add if not present and length < 3, remove if present); `handleStart` calls `initializeGame(selectedIndices, 11)`
- [x] T012 [US1] Update `src/components/GameSetup.css`: replace existing form styles with `.cards-row { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }`, `.game-rules { max-width: 600px; margin: 1rem auto; font-style: italic; }`, `.select-hint { text-align: center; margin-bottom: 1rem; }`, retain `.start-button` and `.game-setup` styles and update heading font size

---

## Phase 4 — User Story 2: Redesigned Game Board with Difficulty Colors (P2)

**Story goal**: The game board ≤ 11×11, tiles display 3 warm-pastel colors (level 1 light yellow, level 2 peach, level 3 coral), level-3 tiles ≤ 20% of total, board panel takes ≥ 60% screen width on desktop.

**Independent test**: Start a game and open browser devtools. Inspect board tiles: confirm `tile-level-1`, `tile-level-2`, `tile-level-3` classes present; count `tile-level-3` elements and verify < 25 (< 21% of 121); verify board panel CSS computed width > 60vw on 1280px viewport.

- [x] T013 [US2] Update `src/components/GameBoard.jsx`: import `getTileColorLevel` from `../engine/tileColorMapper`; in the cell render, compute `const colorLevel = getTileColorLevel(pathIndex, spiralPath.length)` and add `tile-level-${colorLevel}` to the cell className (e.g., `className={\`board-cell tile-level-${colorLevel} ${isCenter ? 'center' : ''}\`}`)
- [x] T014 [US2] Update `src/components/GameBoard.css`: add three rules `.board-cell.tile-level-1 { background-color: #fff9c4; }`, `.board-cell.tile-level-2 { background-color: #ffccbc; }`, `.board-cell.tile-level-3 { background-color: #ef9a9a; }`; ensure `.board-cell.center` rule overrides color to maintain center cell distinction (e.g., `background-color: #b39ddb;`)
- [x] T015 [US2] Update `src/App.css` `.game-layout`: set `display: flex; flex-direction: row; gap: 1rem; align-items: flex-start;`; set `.board-section { flex: 0 0 65%; min-width: 0; }`; set `.controls-section { flex: 1; min-width: 240px; }`

---

## Phase 5 — User Story 3: Voice Synthesis Only, No Voice Recognition (P3)

**Story goal**: Questions are read aloud via synthesis. Zero microphone UI, zero recognition API calls, zero permission prompts.

**Independent test**: Start a game and reach a question. Confirm: no microphone icon visible anywhere, no `.voice-status` div in DOM, browser's permission bar does not appear, question text is audible (or silently skipped on unsupported browser).

- [x] T016 [US3] Update `src/components/QuestionPanel.jsx`: remove `import { useSpeechRecognition }` line; remove `const { supported, listening, error, start } = useSpeechRecognition(...)` destructure; remove the `useEffect` that auto-starts recognition; remove the `{!isAnswered && supported && (<div className="voice-status">...)}` JSX block; remove the `{!supported && (<div className="voice-status not-supported">...)}` JSX block; confirm `useSpeechSynthesis` import and call remain intact
- [x] T017 [US3] Update `src/components/QuestionPanel.css`: remove all CSS rules for `.voice-status`, `.voice-status.listening`, `.voice-status.error`, `.voice-status.not-supported`

---

## Phase 6 — User Story 4: Full German Interface During Gameplay (P4)

**Story goal**: Every visible string in all in-game screens is German. No English text remains.

**Independent test**: Play a complete game from start to win screen. Check every visible label, button, stat, and message. All must be German.

- [x] T018 [P] [US4] Update `src/components/QuestionPanel.jsx` German strings: replace `"Loading question..."` → `"Wird geladen..."`, `"Difficulty: "` → `"Schwierigkeit: "`, `"Correct answer: "` → `"Richtige Antwort: "`, feedback `"✓ Richtig!"` already German — keep; `"✗ Falsch!"` already German — keep
- [x] T019 [P] [US4] Update `src/components/TurnIndicator.jsx` German strings: replace `"Current Turn"` → `"Aktueller Zug"`, `"Player "` in `<h3>` → `"Spieler "`, `"Position:"` → `"Position:"` (already fine), `"✓ Correct:"` → `"✓ Richtig:"`, `"✗ Incorrect:"` → `"✗ Falsch:"`, `"All Players"` → `"Alle Spieler"`, `"Position: "` inside players list → `"Position: "`; also replace `title={\`Player ${player.id}\`}` in `GameBoard.jsx` player token → `title={\`Spieler ${player.id}\`}`
- [x] T020 [P] [US4] Update `src/components/DiceRoller.jsx` German strings: replace `"Dice Roll"` heading → `"Würfel"`, `"Roll Dice"` button → `"Würfeln"`, `"Answer correctly to roll"` → `"Richtig antworten zum Würfeln"`, `"Move "` + `" step"` / `" steps!"` → `"Ziehe "` + `" Feld vor"` / `" Felder vor!"`
- [x] T021 [P] [US4] Update `src/components/WinScreen.jsx` German strings: replace `"🎉 Congratulations! 🎉"` → `"🎉 Glückwunsch! 🎉"`, `"Player "` + `" Wins!"` → `(player.name)` + `" hat gewonnen!"`, `"Correct Answers:"` → `"Richtige Antworten:"`, `"Incorrect Answers:"` → `"Falsche Antworten:"`, `"Accuracy:"` → `"Genauigkeit:"`, `"Play Again"` → `"Nochmal spielen"`; also update `h2` to display `{winningPlayer.name} hat gewonnen!` instead of `Player {winner} Wins!`

---

## Final Phase — Polish & Cross-Cutting Concerns

> Cleanup, consistency pass, and build validation.

- [x] T022 Verify `src/utils/constants.js` has no remaining references to voice recognition timeout or player count > 3; confirm `MAX_PLAYERS = 3` and `MAX_BOARD_SIZE = 11` are exported correctly
- [x] T023 Verify `src/store/gameStore.js` `resetGame` action clears all player state so back-navigation produces a clean home screen (check that `players: []` and `gameStatus: 'setup'` are set on reset)
- [x] T024 Run `npm run lint` in the project root and fix any ESLint errors introduced by the changes
- [x] T025 Run `npm run build` and confirm the build completes without errors or warnings about missing imports (especially `useSpeechRecognition` which was deleted)

---

## Dependencies

Stories can be implemented in any order after Phases 1–2 complete, but the recommended sequence minimises broken states during development:

```
Phase 1 (T001–T006)
    │
Phase 2 (T007–T008)   ← store API change; US1 GameSetup depends on this
    │
    ├── US1 (T009–T012)   ← home screen; independently testable, no gameplay needed
    │       │
    │       ├── US2 (T013–T015)  ← board colors; requires a game to be startable (needs US1)
    │       │       │
    │       │       └── US3 (T016–T017)  ← voice removal; can be done in parallel with US2
    │       │
    │       └── US4 (T018–T021)  ← German strings; [P] tasks are all independent of each other
    │
Final Phase (T022–T025)  ← always last
```

**Parallel execution within stories**:
- T004, T005, T006 — three SVG files, no dependencies on each other
- T018, T019, T020, T021 — four different component files, no shared state

---

## Parallel Execution Examples

**US4 (4 tasks in parallel)**:
- Agent 1: T018 — QuestionPanel.jsx German strings
- Agent 2: T019 — TurnIndicator.jsx + GameBoard.jsx German strings
- Agent 3: T020 — DiceRoller.jsx German strings
- Agent 4: T021 — WinScreen.jsx German strings

**Setup SVGs (3 tasks in parallel)**:
- Agent 1: T004 — marie-curie.svg
- Agent 2: T005 — rosa-parks.svg
- Agent 3: T006 — malala-yousafzai.svg

