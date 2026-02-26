# Data Model: UI Redesign & German Localization

**Feature**: 002-ui-redesign-german  
**Date**: 2026-02-26

---

## Overview

This feature modifies three existing in-memory entities and introduces two new ones. No persistence layer is involved; all state lives in the Zustand store for the duration of the session.

---

## New Entities

### CharacterDef *(static, defined in `src/data/characters.js`)*

Read-only data object. Defined at startup; never mutated.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Unique identifier: `0`, `1`, or `2` |
| `name` | `string` | Display name (German-friendly): e.g., `"Marie Curie"` |
| `bio` | `string` | Short German biography (2–3 sentences) |
| `imageSrc` | `string` | URL path to portrait image: `"/images/marie-curie.svg"` |
| `playerColor` | `string` | CSS color assigned to this character's game token |

**Fixed dataset** (3 entries, order matches card display order):

| id | name | playerColor |
|----|------|-------------|
| 0 | Marie Curie | `#e63946` (crimson) |
| 1 | Rosa Parks | `#2a9d8f` (teal) |
| 2 | Malala Yousafzai | `#e9c46a` (gold) |

**Validation rules**:
- Array length is exactly 3 (enforced at build time by the static file).
- `imageSrc` must resolve to a valid asset; placeholder SVGs are shipped in `public/images/`.

---

### TileColorLevel *(computed, not stored)*

Not persisted in state. Computed on the fly in `GameBoard` render via `getTileColorLevel(position, totalCells)`.

| Value | Name | CSS class | Color |
|-------|------|-----------|-------|
| `1` | Easy | `tile-level-1` | Light yellow `#fff9c4` |
| `2` | Medium | `tile-level-2` | Peach/salmon `#ffccbc` |
| `3` | Hard | `tile-level-3` | Coral/rose `#ef9a9a` |

**Distribution** (for 11×11 = 121 tiles):
- Level 1: positions 0–60 (~50%) → ≈ 61 tiles
- Level 2: positions 61–102 (~35%) → ≈ 42 tiles
- Level 3: positions 103–120 (~15%) → ≈ 18 tiles (< 20% hard limit)

---

## Modified Entities

### Player *(in Zustand store: `gameStore.js`)*

Two fields **added**; all existing fields unchanged.

| Field | Type | Status | Description |
|-------|------|--------|-------------|
| `id` | `number` | Existing | 1-based player number |
| `position` | `number` | Existing | Current tile index in spiral path |
| `answeredQuestions` | `number[]` | Existing | IDs of questions answered by this player |
| `correctCount` | `number` | Existing | Count of correct answers |
| `incorrectCount` | `number` | Existing | Count of incorrect answers |
| `color` | `string` | Existing | CSS color inherited from CharacterDef |
| **`name`** | `string` | **NEW** | Character display name (e.g., `"Rosa Parks"`) |
| **`characterId`** | `number` | **NEW** | Reference to CharacterDef.id (0, 1, or 2) |

**Validation rules**:
- `players` array length: 1–3 (down from 1–4; `MAX_PLAYERS = 3`).
- `characterId` values must be unique within the players array (no duplicate characters).
- `name` is derived from `CharacterDef.name` at initialization; read-only after init.

**State transitions**:
```
home screen (setup)
  → player clicks character card → card enters "selected" state (local component state, NOT in store)
  → player clicks "Spiel starten" → store.initializeGame(selectedIndices, 11) called
  → players array populated from selected CharacterDef entries
  → gameStatus: 'setup' → 'playing'

mid-game back navigation
  → store.resetGame() called
  → players array cleared
  → gameStatus: 'playing' → 'setup'
  → home screen re-mounts with no pre-selected cards (local component state resets on unmount)
```

---

### Constants *(in `src/utils/constants.js`)*

| Constant | Old value | New value | Reason |
|----------|-----------|-----------|--------|
| `MAX_PLAYERS` | `4` | `3` | Character card limit (FR-006) |
| `MAX_BOARD_SIZE` | `21` | `11` | Board size cap (FR-008) |
| `DIFFICULTY_LEVELS` | `5` | `5` | **Unchanged** — question selection still uses 5 levels |
| `VOICE_RECOGNITION_TIMEOUT` | `10000` | *(removed)* | Voice recognition deleted (FR-012) |

---

### GameStore *(in `src/store/gameStore.js`)*

Only `initializeGame` signature changes. All other actions remain identical.

**Before**:
```js
initializeGame: (playerCount, boardSize = 11)
```

**After**:
```js
initializeGame: (selectedIndices, boardSize = 11)
// selectedIndices: number[] — e.g., [0, 2] for Marie Curie + Malala Yousafzai
```

Internal mapping:
```js
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
```

---

## Entities Unchanged

| Entity | Location | Notes |
|--------|----------|-------|
| Question | `public/data/questions.json` | No changes; `difficulty` range 1–5 preserved |
| SpiralPath | computed by `spiralGenerator.js` | No changes |
| DifficultyMapper | `src/engine/difficultyMapper.js` | No changes; still maps position → 1-5 for question selection |
| MovementEngine | `src/engine/movementEngine.js` | No changes |
| VictoryChecker | `src/engine/victoryChecker.js` | No changes |
| QuestionSelector | `src/engine/questionSelector.js` | No changes |
| SpeechSynthesis | `src/hooks/useSpeechSynthesis.js` | No changes |
