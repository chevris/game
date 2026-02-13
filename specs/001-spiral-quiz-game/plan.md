# Implementation Plan: Spiral Quiz Game

**Branch**: `001-spiral-quiz-game` | **Date**: 2026-02-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-spiral-quiz-game/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an MVP web-based multiplayer turn-based board game with a spiral path, German history/geography quiz questions, and voice recognition. Players answer questions to earn dice rolls, move along a clockwise spiral path from outer edge to center, with the first player reaching the center winning. The game supports 1-4 local players (hot-seat), uses Web Speech API for German text-to-speech and voice recognition, and runs entirely client-side with no backend or persistence.

**Technical Approach**: React + Vite (JavaScript only) with Zustand for state management. Pure game engine (spiral generation, movement logic, question selection) separated from UI components. Questions stored in static JSON file with difficulty-based selection. Web Speech API integration via custom React hooks with graceful fallback to button-based input.

## Technical Context

**Language/Version**: JavaScript ES6+ (React 19, no TypeScript per constitution)  
**Primary Dependencies**: React 19.2.0, Vite 7.3.1, Zustand (latest), Web Speech API (browser native)  
**Storage**: N/A - In-memory only (Zustand stores), static JSON file for questions in `/public/data/`  
**Testing**: N/A - No testing infrastructure per constitution (manual testing only)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Edge, Safari) with ES6+ and Web Speech API support  
**Project Type**: Single-page web application (frontend only, no backend)  
**Performance Goals**: Board render <2s, TTS playback <1s, voice recognition response <500ms, smooth animations 60fps  
**Constraints**: Client-side only, no persistence, no network calls (except initial asset load), Web Speech API availability  
**Scale/Scope**: 1-4 local players, 11x11 board (121 cells), ~50-100 questions minimum, single game session lifecycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. MVP-First (Radical Scope Control)

✅ **No Backend**: Feature uses client-side only React app; no server, no API endpoints  
✅ **No Authentication**: Hot-seat multiplayer; no user accounts or login  
✅ **No Persistence**: Game state in Zustand stores only; refreshing browser resets game (per A-009)  
✅ **No Testing Infrastructure**: Manual testing only; no Jest/Vitest (per constitution)  
✅ **No Premature Optimization**: Standard React patterns; optimizations deferred until performance measured  
✅ **No Overengineering**: Direct implementation of functional requirements; no abstractions beyond separation of concerns

### II. Architectural Simplicity

✅ **React + Vite**: JavaScript only (no TypeScript); fast dev server with HMR  
✅ **Zustand for State**: Single store for game state, player data, turn management  
✅ **Separation of Concerns**: Game logic in `/src/engine/` (pure functions), UI in `/src/components/`, state in `/src/store/`  
✅ **No Framework Sprawl**: Vanilla CSS only; no Tailwind, no component libraries

### III. No Scope Expansion (NON-NEGOTIABLE)

✅ **No AI Players**: Only human players (1-4 local hot-seat)  
✅ **No Networking**: All logic client-side; no WebSockets, no multiplayer sync (A-005)  
✅ **No User Accounts**: No registration, no profiles  
✅ **No Persistent Storage**: In-memory state only; no localStorage, no IndexedDB  
✅ **No Styling Framework Requirement**: Using vanilla CSS (allowed but not mandated)

### Additional Compliance

✅ **Maintainability**: Simple folder structure, clear naming, junior-dev readable code  
✅ **Modularity**: Pure game engine functions testable in isolation (though no formal tests)  
✅ **Determinism**: State transitions via Zustand actions; predictable state updates  
✅ **In-Memory Only**: All state in Zustand; questions loaded once from static JSON

**Result**: ✅ **PASS** - No constitution violations. Feature fully compliant with MVP-first principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-spiral-quiz-game/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── questions-schema.json
└── checklists/
    └── requirements.md  # Quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── components/          # React UI components
│   ├── GameBoard.jsx   # Grid rendering, spiral visualization, player tokens
│   ├── QuestionPanel.jsx # Question display, answer buttons, voice controls
│   ├── DiceRoller.jsx  # Dice animation and roll trigger
│   ├── TurnIndicator.jsx # Current player, turn status
│   ├── WinScreen.jsx   # Victory message and game restart
│   └── GameSetup.jsx   # Player count selection, board size config
├── store/              # Zustand state management
│   └── gameStore.js    # Single store: game state, players, turns, questions
├── engine/             # Pure game logic (no React dependencies)
│   ├── spiralGenerator.js # generateSpiral(size) → array of {x, y}
│   ├── movementEngine.js  # movePlayer(index, roll) → newIndex
│   ├── questionSelector.js # selectQuestion(difficulty, usedIds) → question
│   ├── difficultyMapper.js # getDifficulty(position, totalCells) → 1-5
│   └── victoryChecker.js  # checkWin(position, centerIndex) → boolean
├── hooks/              # Custom React hooks
│   ├── useSpeechSynthesis.js # TTS hook for German voice
│   └── useSpeechRecognition.js # Voice input hook with A/B/C filtering
├── utils/              # Helper utilities
│   ├── constants.js    # Game constants (board size, max players, etc.)
│   └── logger.js       # Console logging helper (optional)
├── data/               # Static data (alternative to public/)
│   └── (not used - questions in public/data/)
├── App.jsx             # Root component, game flow orchestration
├── main.jsx            # Vite entry point
└── index.css           # Global styles

public/
└── data/
    └── questions.json  # German quiz questions (static asset)

# Existing files (preserved)
index.html
package.json
vite.config.js
eslint.config.js
README.md
```

**Structure Decision**: Single-page web application using default Vite structure. Game engine logic separated into `/src/engine/` to comply with constitution's separation of concerns mandate. UI components in `/src/components/` consume engine functions via Zustand store actions. Custom hooks in `/src/hooks/` encapsulate Web Speech API complexity. Questions stored in `/public/data/` as static JSON file loaded at runtime. No test directories per constitution (no testing infrastructure).

## Complexity Tracking

> **No violations** - Constitution check passed cleanly. No complexity justifications required.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts completed (2026-02-13)*

### I. MVP-First (Radical Scope Control)

✅ **No Backend**: Architecture uses client-side React only; questions served as static JSON from `/public/data/`  
✅ **No Authentication**: Game setup has no login; players identified by ID 1-4 only  
✅ **No Persistence**: Zustand store confirmed in-memory only; no localStorage calls in design  
✅ **No Testing Infrastructure**: Quickstart uses manual testing checklist; no test files in structure  
✅ **No Premature Optimization**: Standard patterns used; no memoization, no virtualization, no workers  
✅ **No Overengineering**: Direct mapping from requirements to implementation; no abstractions beyond engine separation

### II. Architectural Simplicity

✅ **React + Vite**: Confirmed JavaScript-only; no TypeScript files in project structure  
✅ **Zustand for State**: Single store pattern in `gameStore.js`; no Redux, no Context API complexity  
✅ **Separation of Concerns**: Pure functions in `/src/engine/` confirmed; UI components in `/src/components/`  
✅ **No Framework Sprawl**: Vanilla CSS mentioned in quickstart; no Tailwind, no styled-components

### III. No Scope Expansion (NON-NEGOTIABLE)

✅ **No AI Players**: Player actions require human input (button/voice); no bot logic  
✅ **No Networking**: No WebSocket, no fetch calls except static JSON load  
✅ **No User Accounts**: No authentication, no user profiles in data model  
✅ **No Persistent Storage**: Data model confirms in-memory only; refresh = reset  
✅ **No Styling Framework Requirement**: Not mandated; vanilla CSS sufficient

### Additional Compliance

✅ **Maintainability**: Quickstart written for junior devs; simple patterns, clear comments  
✅ **Modularity**: Engine functions pure and testable (though not tested per constitution)  
✅ **Determinism**: Zustand actions follow predictable state transitions documented in data model  
✅ **In-Memory Only**: Questions loaded once from JSON; all state in Zustand store

**Result**: ✅ **PASS** - Design maintains full constitution compliance. No violations introduced during planning phase.

---

## Phase Outputs Summary

### Phase 0: Research
- ✅ `research.md` - Algorithm decisions, best practices, risk mitigation

### Phase 1: Design
- ✅ `data-model.md` - Entities, relationships, state schema, lifecycle
- ✅ `contracts/questions-schema.json` - JSON schema validation
- ✅ `contracts/questions-sample.json` - 50 German quiz questions (5 difficulty levels)
- ✅ `quickstart.md` - Step-by-step implementation guide with code examples

### Phase 1 Post-Actions
- ✅ Agent context updated: `.github/agents/copilot-instructions.md` created
- ✅ Constitution re-check: PASS (no violations)

---

## Ready for Implementation

All planning artifacts complete. Next command: `/speckit.tasks` to generate detailed task breakdown, or proceed directly to implementation following `quickstart.md`.
