# Research: UI Redesign & German Localization

**Feature**: 002-ui-redesign-german  
**Date**: 2026-02-26  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## 1. Tile Visual Difficulty Mapping

### Unknowns Going In
- `difficultyMapper.js` returns 5 difficulty levels for question selection.
- Spec requires exactly 3 visual tile colors with ~50/35/15 distribution.
- Risk: changing difficultyMapper to 3 levels would break question selection (questions.json has 50 questions across difficulties 1–5).

### Research Findings
**Code analysis**: `src/engine/difficultyMapper.js` feeds into `questionSelector.js` via `presentQuestion()` in the store. The question selector specifically filters `q.difficulty === difficulty` and falls back to adjacent levels. Reducing to 3 levels would mean difficulties 4 & 5 in questions.json would only be reached via fallback — functionally degraded.

### Decision
Add a **separate visual-only function** `getTileColorLevel(position, totalCells)` in a new `src/engine/tileColorMapper.js` file. This function returns 1, 2, or 3 purely for tile color rendering, with thresholds tuned to the 50/35/15 target distribution:

```
progress 0–50%  → level 1 (light yellow)   ≈ 50% of tiles
progress 50–85% → level 2 (peach/salmon)   ≈ 35% of tiles
progress 85–100%→ level 3 (coral/rose)     ≈ 15% of tiles
```

`difficultyMapper.js` remains **unchanged** — question selection still uses 5 levels. Visual coloring and question difficulty are **independent concerns**.

**Rationale**: Zero risk to question system. Correct distribution. Clean separation of concerns.  
**Alternatives considered**: (a) Change difficultyMapper to 3 levels — rejected because it breaks question fallback logic and downgrades question coverage. (b) Map 5→3 via a translation layer inside GameBoard — same outcome as separate file but murkier responsibility boundary.

---

## 2. Board Size Cap (11×11 Maximum)

### Unknowns Going In
- `constants.js` has `MAX_BOARD_SIZE = 21`. `GameSetup.jsx` shows board size picker with options 5–21.
- `spiralGenerator.js` accepts any odd integer — no built-in cap.
- Store already defaults `boardSize: 11`.

### Research Findings
The board size selector is only used in `GameSetup.jsx`. No other file reads `MAX_BOARD_SIZE` for rendering limits. Making the board always 11×11 means removing the board size picker entirely from the setup screen and hardcoding the value passed to `initializeGame`.

### Decision
Remove the board size picker from `GameSetup.jsx`. Always call `initializeGame(selectedCount, 11)`. Update `constants.js`: `MAX_BOARD_SIZE = 11`. The `spiralGenerator.js` does not need changes (it already handles size 11 correctly).

**Rationale**: Simplest implementation; board size selection was never part of this feature's scope. Keeping 11 as the sole option also validates the 50/35/15 tile distribution more predictably (121 tiles).  
**Alternatives considered**: Keep board size picker but cap at 11 — rejected as unnecessary UI complexity; single board size is simpler and aligns with spec.

---

## 3. Voice Recognition Removal

### Unknowns Going In
- `useSpeechRecognition.js` is imported and used in `QuestionPanel.jsx`.
- `constants.js` has `VOICE_RECOGNITION_TIMEOUT = 10000`.
- Need to confirm no other file imports or calls it.

### Research Findings
**Grep result**: `useSpeechRecognition` appears only in `QuestionPanel.jsx`. The auto-start `useEffect` in `QuestionPanel` triggers recognition whenever a question appears. The voice-status `<div>` renders microphone UI conditionally on `supported` and `listening` values from the hook.

**Files to change**:
- `QuestionPanel.jsx`: Remove `useSpeechRecognition` import, the `{ supported, listening, error, start }` destructure, the `useEffect` that auto-starts recognition, the `voice-status` div, the `not-supported` div.
- `constants.js`: Remove `VOICE_RECOGNITION_TIMEOUT`.
- `QuestionPanel.css`: Remove `.voice-status`, `.voice-status.listening`, `.voice-status.error`, `.voice-status.not-supported` rules.

**Files to delete**:
- `src/hooks/useSpeechRecognition.js` — entire file removed.

**useSpeechSynthesis.js**: Kept entirely unchanged. It is already well-implemented (German `de-DE` locale, async voice loading, silent fallback on unsupported browsers).

### Decision
Delete `useSpeechRecognition.js`. Strip all recognition code from `QuestionPanel.jsx`. Keep `useSpeechSynthesis` and its CSS unchanged.

---

## 4. Character Card Player Selection

### Unknowns Going In
- Current `GameSetup.jsx` uses a dropdown for player count (1–4).
- Store's `initializeGame(playerCount, boardSize)` creates generic player objects: `{id, position, answeredQuestions, correctCount, incorrectCount, color}`.
- Max players = 4, but spec requires max = 3 (one per character card).
- Need: image placeholder, name, bio, selected state per card.

### Research Findings
The store doesn't need deep surgery. `initializeGame` can be updated to accept `selectedCharacterIndices` (array of 0, 1, or 2), and create players with an additional `name` and `characterId` field. The rest of the game logic (position, answers, colors) is unaffected.

Character images: bare SVG placeholder files are the lightest option (no external dependency). One SVG per woman stored in `public/images/` for easy replacement.

Bio text: short static strings (German), defined in `src/data/characters.js`.

Touch bio display: `ⓘ` button triggers a CSS overlay (`:focus-within` or a boolean React state toggle). No hover-only dependency.

### Decision
- Add `src/data/characters.js`: array of 3 character objects with `{ id, name, bio, imageSrc, playerColor }`.
- Replace player count dropdown in `GameSetup.jsx` with a flex row of 3 `<CharacterCard>` components.
- Add `src/components/CharacterCard.jsx` + `CharacterCard.css`: card with portrait `<img>`, name `<p>`, `<button className="info-btn">ⓘ</button>`, and a modal/overlay `<div>` toggled by React state.
- Update store: `initializeGame(selectedIndices, boardSize)` → players built from `characters[index]` data.
- `TurnIndicator.jsx`, `WinScreen.jsx` use `player.name` (e.g., "Marie Curie") instead of "Player 1".
- `constants.js`: `MAX_PLAYERS = 3`.

**Alternatives considered**: Using localStorage for portrait images — rejected (constitution forbids persistence). Using an external avatar API — rejected (constitution forbids networking).

---

## 5. German Internationalization Scope

### Unknowns Going In
- Which components contain English strings?
- Are there English strings in CSS class names that affect visible content?

### Research Findings
Full scan of all `.jsx` files:

| File | English strings found |
|------|----------------------|
| `GameSetup.jsx` | "Spiral Quiz Game", "Number of Players", "Board Size", "Start Game", "1 Player", "2 Players" etc. |
| `QuestionPanel.jsx` | "Loading question...", "Difficulty: ", "Say A, B, or C", "Voice recognition ready", "Voice not supported - use buttons below", "Correct answer: " |
| `TurnIndicator.jsx` | "Current Turn", "Player X", "Position:", "Correct:", "Incorrect:", "All Players" |
| `DiceRoller.jsx` | "Dice Roll", "Roll Dice", "Answer correctly to roll", "Move X steps!" |
| `WinScreen.jsx` | "Congratulations!", "Player X Wins!", "Correct Answers:", "Incorrect Answers:", "Accuracy:", "Play Again" |
| `GameBoard.jsx` | `title="Player X"` (tooltip on player token) |

No English strings in CSS class names affect visible rendered text.

### Decision
Replace all English strings in the above files with their German equivalents. Canonical glossary:

| English | German |
|---------|--------|
| Start Game | Spiel starten |
| Player | Spieler |
| Score / Correct Answers | Punktestand / Richtige Antworten |
| Roll Dice | Würfeln |
| Correct | Richtig |
| Incorrect / Wrong | Falsch |
| Won / Congratulations | Gewonnen / Glückwunsch |
| Play Again | Nochmal spielen |
| Difficulty | Schwierigkeit |
| Loading... | Wird geladen... |
| Current Turn | Aktueller Zug |
| Position | Position |
| All Players | Alle Spieler |
| Move X steps | Ziehe X Felder vor |
| Accuracy | Genauigkeit |

---

## 6. Board Dominant-Left Layout

### Unknowns Going In
- Current `App.css` has `.game-layout` with `.board-section` and `.controls-section`.
- Spec requires board at ≥ 60% of screen width.

### Research Findings
`App.jsx` already uses `.game-layout > .board-section + .controls-section` structure. Only CSS changes are needed — no JSX restructuring.

### Decision
Update `.game-layout` to `display: flex; flex-direction: row`. Set `.board-section { flex: 0 0 65%; }` and `.controls-section { flex: 1; }`. No component restructuring required.

---

## Summary: Files Changed / Added / Deleted

| Action | File | Reason |
|--------|------|--------|
| **NEW** | `src/engine/tileColorMapper.js` | Visual-only difficulty → 3-level tile color |
| **NEW** | `src/data/characters.js` | Marie Curie, Rosa Parks, Malala Yousafzai static data |
| **NEW** | `src/components/CharacterCard.jsx` | Character card UI with ⓘ bio overlay |
| **NEW** | `src/components/CharacterCard.css` | Card styles |
| **NEW** | `public/images/marie-curie.svg` | Portrait placeholder |
| **NEW** | `public/images/rosa-parks.svg` | Portrait placeholder |
| **NEW** | `public/images/malala-yousafzai.svg` | Portrait placeholder |
| **MODIFY** | `src/components/GameSetup.jsx` | Character cards, German text, remove board size picker |
| **MODIFY** | `src/components/GameSetup.css` | Card grid layout |
| **MODIFY** | `src/components/GameBoard.jsx` | Add tile color classes via tileColorMapper |
| **MODIFY** | `src/components/GameBoard.css` | Add `.tile-level-1/2/3` color rules |
| **MODIFY** | `src/components/QuestionPanel.jsx` | Remove voice recognition, German strings |
| **MODIFY** | `src/components/QuestionPanel.css` | Remove voice-status CSS rules |
| **MODIFY** | `src/components/TurnIndicator.jsx` | German strings, use player.name |
| **MODIFY** | `src/components/DiceRoller.jsx` | German strings |
| **MODIFY** | `src/components/WinScreen.jsx` | German strings, use player.name |
| **MODIFY** | `src/store/gameStore.js` | Accept character selections, add name/characterId to player |
| **MODIFY** | `src/utils/constants.js` | MAX_PLAYERS=3, MAX_BOARD_SIZE=11, remove VOICE_RECOGNITION_TIMEOUT |
| **MODIFY** | `src/App.css` | Board dominant-left (65% width) |
| **DELETE** | `src/hooks/useSpeechRecognition.js` | Voice recognition removed per FR-012 |
