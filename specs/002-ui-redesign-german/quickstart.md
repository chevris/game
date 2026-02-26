# Quickstart: UI Redesign & German Localization

**Branch**: `002-ui-redesign-german`  
**Stack**: React 19 + Vite 7 + Zustand (JavaScript only, no TypeScript)

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Install & Run

```bash
cd game
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Implementation Order

Work through the tasks in this order to keep the app functional at every step:

### Step 1 — Add static data and new engine utility (no visible change yet)

1. Create `src/data/characters.js` with the 3 CharacterDef objects (Marie Curie, Rosa Parks, Malala Yousafzai).
2. Create `src/engine/tileColorMapper.js` exporting `getTileColorLevel(position, totalCells)`.
3. Create placeholder SVG portraits in `public/images/` (one file per character).
4. Update `src/utils/constants.js`: `MAX_PLAYERS = 3`, `MAX_BOARD_SIZE = 11`, remove `VOICE_RECOGNITION_TIMEOUT`.

### Step 2 — Remove voice recognition

1. Delete `src/hooks/useSpeechRecognition.js`.
2. Strip import and all recognition logic from `src/components/QuestionPanel.jsx`.
3. Remove `.voice-status*` CSS rules from `QuestionPanel.css`.
4. Confirm app still runs (`npm run dev`): question panel shows buttons only.

### Step 3 — German strings in gameplay components

Update text strings to German in:
- `QuestionPanel.jsx` — "Wird geladen...", "Schwierigkeit:", "Richtig!", "Falsch!", "Richtige Antwort:"
- `TurnIndicator.jsx` — "Aktueller Zug", "Spieler X", "Position:", "Richtig:", "Falsch:", "Alle Spieler"
- `DiceRoller.jsx` — "Würfel", "Würfeln", "Beantworte richtig zum Würfeln", "Ziehe X Felder vor"
- `WinScreen.jsx` — "Glückwunsch! 🎉", "Spieler X hat gewonnen!", "Richtige Antworten:", "Falsche Antworten:", "Genauigkeit:", "Nochmal spielen"
- `GameBoard.jsx` — `title` attribute on player token

### Step 4 — Tile difficulty colors

1. In `GameBoard.jsx`, import `getTileColorLevel` and add the level as a CSS class to each `.board-cell`.
2. In `GameBoard.css`, add three class rules:
   ```css
   .board-cell.tile-level-1 { background-color: #fff9c4; } /* light yellow */
   .board-cell.tile-level-2 { background-color: #ffccbc; } /* peach */
   .board-cell.tile-level-3 { background-color: #ef9a9a; } /* coral */
   ```

### Step 5 — Update game store

Update `gameStore.js`:
- Change `initializeGame(playerCount, boardSize)` → `initializeGame(selectedIndices, boardSize)`.
- Build players from `characters[charId]` (include `name` and `characterId`).
- Hardcode `boardSize = 11` as the default and only value.

### Step 6 — Redesign GameSetup (Home page)

1. Create `CharacterCard.jsx` + `CharacterCard.css`.
2. Rewrite `GameSetup.jsx`:
   - Title: "Der Weg zur Gleichheit"
   - Rules text below title
   - Render 3 `<CharacterCard>` in a flex row
   - "Spiel starten" button (disabled until ≥1 card selected)
3. Update `GameSetup.css` for the new layout.

### Step 7 — Board dominant-left layout

Update `App.css`:
```css
.game-layout {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.board-section {
  flex: 0 0 65%;
}
.controls-section {
  flex: 1;
}
```

---

## Verifying the Build

```bash
npm run lint   # no errors expected
npm run build  # must produce dist/ without errors
npm run preview
```

Open the app and run through the manual acceptance checklist in `checklists/requirements.md`.

---

## Replacing Portrait Placeholders (Post-MVP)

To swap in real portraits:
1. Replace the SVG file in `public/images/` with any image format (`.jpg`, `.png`, `.webp`).
2. Update the `imageSrc` field in `src/data/characters.js` to match the new filename.
3. No component changes needed.
