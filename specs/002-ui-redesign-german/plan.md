# Implementation Plan: UI Redesign & German Localization

**Branch**: `002-ui-redesign-german` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-ui-redesign-german/spec.md`

---

## Summary

Redesign the game's home screen and gameplay UI to be fully in German, featuring a character-card player-selection system (Marie Curie, Rosa Parks, Malala Yousafzai), a 3-color warm-pastel tile difficulty visualization, an 11×11 maximum board, and the removal of all voice recognition code while preserving voice synthesis. All changes are purely client-side React modifications with no new dependencies.

---

## Technical Context

**Language/Version**: JavaScript ES2022+, React 19.2, Vite 7.3  
**Primary Dependencies**: React 19, Vite 7, Zustand 5 (state management) — no additions  
**Storage**: N/A (in-memory session state only; constitution prohibits persistence)  
**Testing**: None (constitution prohibits testing frameworks)  
**Target Platform**: Modern browser, client-side only (Chromium / Firefox / Safari)  
**Project Type**: Single-page web app  
**Performance Goals**: Home screen loads in ≤ 2 s; board renders 121 tiles at 60 fps  
**Constraints**: No TypeScript, no CSS frameworks, no backend, no localStorage, max 3 players, board max 11×11  
**Scale/Scope**: 3-player max, 121-tile board, 50 questions (existing dataset), 7 screens/states

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. MVP-First — No Backend** | ✅ PASS | All changes are client-side React/CSS; no server introduced |
| **I. MVP-First — No Persistence** | ✅ PASS | Character selection is local component state; game state is in-memory Zustand only |
| **I. MVP-First — No Authentication** | ✅ PASS | No login, no accounts |
| **I. MVP-First — No Testing Infrastructure** | ✅ PASS | No test files added |
| **I. MVP-First — No Overengineering** | ✅ PASS | Every new file serves an immediate demonstrable user need |
| **II. Architectural Simplicity — React + Vite JS only** | ✅ PASS | No TypeScript introduced |
| **II. Architectural Simplicity — Zustand for state** | ✅ PASS | Store updated in-place; no additional state libraries |
| **II. Architectural Simplicity — No styling framework** | ✅ PASS | Vanilla CSS only |
| **II. Architectural Simplicity — Game logic separate from UI** | ✅ PASS | New `tileColorMapper.js` is a pure engine utility; `characters.js` is pure data |
| **III. No Scope Expansion — No AI Players** | ✅ PASS | No AI logic |
| **III. No Scope Expansion — No Networking** | ✅ PASS | No WebSockets, no HTTP calls added |
| **III. No Scope Expansion — No Persistent Storage** | ✅ PASS | Confirmed |

**Constitution Check Result: ALL GATES PASS. No violations.**

---

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-redesign-german/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── research.md          ← Phase 0 technical decisions
├── data-model.md        ← entity definitions
├── quickstart.md        ← developer setup & implementation order
├── contracts/
│   └── character-data-schema.json  ← CharacterDef JSON schema with examples
├── checklists/
│   └── requirements.md ← specification quality checklist
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code Changes

```text
src/
├── data/
│   └── characters.js            NEW  — CharacterDef[3] static array
├── engine/
│   ├── difficultyMapper.js      UNCHANGED
│   ├── movementEngine.js        UNCHANGED
│   ├── questionSelector.js      UNCHANGED
│   ├── spiralGenerator.js       UNCHANGED
│   ├── tileColorMapper.js       NEW  — getTileColorLevel(pos, total) → 1|2|3
│   └── victoryChecker.js        UNCHANGED
├── hooks/
│   ├── useSpeechRecognition.js  DELETE
│   └── useSpeechSynthesis.js    UNCHANGED
├── store/
│   └── gameStore.js             MODIFY — initializeGame accepts selectedIndices[]
├── utils/
│   └── constants.js             MODIFY — MAX_PLAYERS=3, MAX_BOARD_SIZE=11, remove VOICE_RECOGNITION_TIMEOUT
├── components/
│   ├── CharacterCard.jsx        NEW  — portrait + name + ⓘ bio overlay
│   ├── CharacterCard.css        NEW
│   ├── DiceRoller.jsx           MODIFY — German strings
│   ├── DiceRoller.css           UNCHANGED
│   ├── GameBoard.jsx            MODIFY — add tile-level-N CSS classes
│   ├── GameBoard.css            MODIFY — add .tile-level-1/2/3 color rules
│   ├── GameSetup.jsx            MODIFY — character cards, German text, remove board picker
│   ├── GameSetup.css            MODIFY — card grid layout
│   ├── QuestionPanel.jsx        MODIFY — remove voice recognition, German strings
│   ├── QuestionPanel.css        MODIFY — remove .voice-status rules
│   ├── TurnIndicator.jsx        MODIFY — German strings, player.name
│   ├── TurnIndicator.css        UNCHANGED
│   ├── WinScreen.jsx            MODIFY — German strings, player.name
│   └── WinScreen.css            UNCHANGED
├── App.jsx                      UNCHANGED (layout structure already correct)
└── App.css                      MODIFY — board-section flex: 0 0 65%

public/
└── images/
    ├── marie-curie.svg          NEW  — portrait placeholder
    ├── rosa-parks.svg           NEW  — portrait placeholder
    └── malala-yousafzai.svg     NEW  — portrait placeholder
```

**Structure Decision**: Single web application. No backend, no build step changes. All modifications are inside the existing `src/` tree. New files follow the existing naming conventions (`camelCase` for JS modules, `PascalCase` for components).

---

## Phase 0: Research Summary

All NEEDS CLARIFICATION items resolved. See [research.md](./research.md) for full decision rationale.

| Unknown | Decision |
|---------|----------|
| Tile visual coloring vs. 5-level question difficulty | Separate `tileColorMapper.js` for visual (3 levels); `difficultyMapper.js` unchanged (5 levels for questions) |
| Board size cap | Remove board size picker; always pass `boardSize = 11` |
| Voice recognition scope | Delete `useSpeechRecognition.js`; strip all recognition code from `QuestionPanel.jsx` |
| Character card bio on touch devices | Persistent ⓘ icon + React state toggle overlay (no hover dependency) |
| Mid-game back navigation | `resetGame()` on back; home screen re-mounts with clean state |
| Level-3 tile frequency | `getTileColorLevel` thresholds: 0–50% → L1, 50–85% → L2, 85–100% → L3 (~15%) |

---

## Phase 1: Design Decisions

### New: `src/data/characters.js`

```js
export const characters = [
  { id: 0, name: 'Marie Curie',      bio: '...German bio...', imageSrc: '/images/marie-curie.svg',      playerColor: '#e63946' },
  { id: 1, name: 'Rosa Parks',       bio: '...German bio...', imageSrc: '/images/rosa-parks.svg',       playerColor: '#2a9d8f' },
  { id: 2, name: 'Malala Yousafzai', bio: '...German bio...', imageSrc: '/images/malala-yousafzai.svg', playerColor: '#e9c46a' },
];
```

### New: `src/engine/tileColorMapper.js`

```js
export function getTileColorLevel(position, totalCells) {
  const p = position / totalCells;
  if (p < 0.50) return 1;
  if (p < 0.85) return 2;
  return 3;
}
```

### Updated: `gameStore.initializeGame`

```js
initializeGame: (selectedIndices, boardSize = 11) => {
  // selectedIndices: number[] of charId values e.g. [0, 2]
  players: selectedIndices.map((charId, i) => ({
    id: i + 1,
    position: 0,
    answeredQuestions: [],
    correctCount: 0,
    incorrectCount: 0,
    color: characters[charId].playerColor,
    name: characters[charId].name,
    characterId: charId,
  }))
}
```

### CharacterCard component contract

```
Props: { character, selected, onSelect }
UI:
  ┌─────────────────────┐
  │  [portrait image]   │
  │                  ⓘ │  ← button, toggles bioVisible state
  │  Name              │
  └─────────────────────┘
  [selected state: highlighted border]

  Bio overlay (absolute, z-index above card):
  ┌─────────────────────┐
  │ × "Name"           │
  │ "...bio text..."    │
  └─────────────────────┘
```

### Constitution Re-check (post-design)

All additions (1 data file, 1 engine util, 1 component, 3 SVGs) serve direct user-visible requirements. No new dependency in `package.json`. Constitution fully respected.

---

## Complexity Tracking

*No constitution violations — this section is empty by design.*
