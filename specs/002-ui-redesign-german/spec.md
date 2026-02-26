# Feature Specification: UI Redesign & German Localization

**Feature Branch**: `002-ui-redesign-german`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "Remove voice recognition, keep voice synthesis. Redesign Home Page: title to 'Der Weg zur Gleichheit', add game rules text, replace player dropdown with 3 character cards featuring famous women with hover bios. Game board: max 11x11, 3 difficulty colors with level-3 rarer, board enlarged on left. Full German internationalization."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - German-Language Start Screen (Priority: P1)

A player opens the game and sees the start screen entirely in German. The title reads "Der Weg zur Gleichheit". Below the title is the rule text in German. The player selects up to 3 participants by clicking on character cards representing famous women; each card shows a portrait placeholder and the woman's name. Hovering over a card reveals a short biographical note. The player then starts the game.

**Why this priority**: The home page is the first thing every player sees. Correct title, rules, and player selection are prerequisites for all other feature areas, and German-only text is a hard requirement.

**Independent Test**: Can be fully tested by opening the application in a browser without starting a game: verify German title, rules text, 3 character cards render, hover tooltips appear with bio text, and the begin-game action is enabled only when at least one card is selected.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** the home screen is displayed, **Then** the title "Der Weg zur Gleichheit" is visible and no English text appears anywhere on the page.
2. **Given** the home screen, **When** the player hovers over a character card, **Then** a tooltip or overlay appears containing biographical information about that woman.
3. **Given** the home screen, **When** the player selects 1 to 3 character cards, **Then** selected state is visually indicated and the "Spiel starten" button becomes active.
4. **Given** the home screen, **When** no character card is selected, **Then** the game cannot be started.
5. **Given** the home screen, **When** 3 cards are already selected, **Then** selecting a fourth card is not possible (maximum enforced).

---

### User Story 2 - Redesigned Game Board with Difficulty Colors (Priority: P2)

A player is on the game board. The board occupies the dominant left portion of the screen and is at most 11×11 tiles. Tiles are visually color-coded in three groups representing three difficulty levels. Level-3 (hardest) tiles are noticeably fewer than level-1 and level-2 tiles.

**Why this priority**: The board is the core game surface. Visual difficulty cues directly affect gameplay strategy and must work reliably before cosmetic or voice changes are meaningful.

**Independent Test**: Can be fully tested by starting a game and inspecting the rendered board: verify dimensions ≤ 11×11, three distinct tile colors present, level-3 color appears less frequently than the other two, and the board panel is wider than other UI panels.

**Acceptance Scenarios**:

1. **Given** a game is started, **When** the board is rendered, **Then** it contains no more than 121 tiles (11 columns × 11 rows).
2. **Given** the board, **When** inspecting tile colors, **Then** exactly three distinct difficulty colors are visible.
3. **Given** the board, **When** counting tiles per difficulty, **Then** the count of level-3 tiles is lower than the count of level-1 tiles and lower than the count of level-2 tiles.
4. **Given** the game layout, **When** the board and side panels are displayed together, **Then** the board occupies more horizontal space than the combined side panels.

---

### User Story 3 - Voice Synthesis Only, No Voice Recognition (Priority: P3)

During gameplay, the game reads questions aloud using voice synthesis. The microphone button, voice input field, and any speech-recognition-related controls are absent from the interface. Players answer questions using only on-screen interactions.

**Why this priority**: Removing voice recognition eliminates an unused or malfunctioning input path and simplifies the UX. Voice synthesis (read-aloud) is preserved as a helpful accessibility aid.

**Independent Test**: Can be fully tested by playing through a complete question round: confirm that questions are read aloud automatically, that no microphone controls or voice-input UI elements are visible, and that answers are submitted via touch/click only.

**Acceptance Scenarios**:

1. **Given** a question is presented, **When** the question panel loads, **Then** the question text is read aloud automatically via voice synthesis.
2. **Given** the question panel, **When** inspecting all visible controls, **Then** no microphone icon, voice-input button, or speech-recognition indicator is present.
3. **Given** a player answers a question by clicking an answer option, **Then** the answer is registered without any voice input being required.
4. **Given** the game settings or any screen, **When** the player navigates the entire application, **Then** no voice-recognition permission request is triggered.

---

### User Story 4 - Full German Interface During Gameplay (Priority: P4)

All labels, buttons, scores, turn indicators, win screens, and messages that appear during the game are displayed in German. No English strings remain in the running application.

**Why this priority**: Consistent German localization throughout the game session is required to meet the language specification, but can be addressed after higher-priority structural changes are stable.

**Independent Test**: Can be fully tested by playing a complete game from start to finish while checking every visible text element: all labels must be German equivalents (e.g., "Spieler", "Punktestand", "Würfeln", "Richtig", "Falsch", "Gewonnen").

**Acceptance Scenarios**:

1. **Given** the turn indicator is visible, **When** it shows whose turn it is, **Then** the label reads "Spieler [N] ist dran" or equivalent German phrasing.
2. **Given** a player earns points, **When** the score is updated, **Then** the score label reads "Punktestand" or equivalent German.
3. **Given** a player wins, **When** the win screen is displayed, **Then** all text on the screen is in German.
4. **Given** any error or informational message, **When** it is shown, **Then** it is displayed in German.

---

### Edge Cases

- What happens when a player navigates back to the home screen mid-game? → Resolved: the current game ends immediately and the home screen resets to a clean state with no cards pre-selected.
- How does the board color distribution behave if the total tile count is very small (e.g., below 10 tiles) — can all three difficulty levels still be represented?
- What happens if the browser does not support the Web Speech API for synthesis — is a silent fallback provided without error or crash?
- How does the character card bio behave on touch-only devices? → Resolved: a persistent ⓘ icon on each card opens a bio overlay on tap; no hover dependency.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home screen title MUST display "Der Weg zur Gleichheit".
- **FR-002**: The home screen MUST display the German rules text: "Sei der Erste, der das Ziel erreicht, indem du Fragen zur Geschichte der Frauen weltweit richtig beantwortest. Aber Vorsicht: 'Manche Fragen sind kniffliger als andere!'"
- **FR-003**: The player-selection dropdown MUST be removed and replaced with exactly 3 character cards.
- **FR-004**: Each character card MUST display a portrait image placeholder (easily replaceable) and the woman's name below it. The three featured women are: **Marie Curie**, **Rosa Parks**, and **Malala Yousafzai**.
- **FR-005**: Each character card MUST display a persistent ⓘ icon. Clicking or tapping the ⓘ icon opens a bio overlay showing the biographical information. On desktop, hovering the card may also reveal the overlay; the ⓘ icon remains the primary and universally supported trigger.
- **FR-006**: The maximum number of selectable players MUST be 3, corresponding to the 3 character cards.
- **FR-007**: The game MUST NOT start unless at least 1 character card is selected.
- **FR-008**: The game board MUST have a maximum size of 11×11 tiles (121 tiles total).
- **FR-009**: Board tiles MUST be rendered in exactly 3 visually distinct colors using a warm pastel palette: Level 1 (easy) = light yellow, Level 2 (medium) = peach/salmon, Level 3 (hard) = coral/rose.
- **FR-010**: Level-3 (hardest) tiles MUST appear less frequently than level-1 and level-2 tiles. The target distribution is approximately 50% Level 1, 35% Level 2, and 15% Level 3 (level-3 tiles MUST NOT exceed 20% of total tiles).
- **FR-011**: The game board panel MUST occupy the dominant (largest) horizontal area of the game screen layout, positioned on the left side.
- **FR-012**: Voice recognition (speech-to-text / microphone input) MUST be completely removed from the application — no UI controls, no background calls, no permission requests.
- **FR-013**: Voice synthesis (text-to-speech read-aloud) MUST remain active and automatically read question text when a question is presented.
- **FR-014**: Every visible text string in the application MUST be in German; no English strings may remain in the interface.
- **FR-015**: Game-specific terms MUST use their German equivalents, including but not limited to: "Spieler" (Player), "Punktestand" (Score), "Würfeln" (Roll), "Richtig" (Correct), "Falsch" (Wrong), "Gewonnen" (Won), "Spiel starten" (Start Game).
- **FR-016**: Navigating back to the home screen during an active game MUST immediately end the current game and reset the home screen to a clean state; no character cards are pre-selected and no game data from the previous session is preserved.

### Key Entities

- **Charakterkarte (Character Card)**: Represents a selectable player identity on the home screen. Attributes: portrait image (placeholder), person name, biographical text, selected state (boolean).
- **Schwierigkeitsstufe (Difficulty Level)**: One of three classifications (1 = easy, 2 = medium, 3 = hard) assigned to each board tile. Determines the visual tile color and the question pool drawn from.
- **Spielfeld (Game Board)**: The spiral grid of tiles, capped at 11×11. Each tile has a position index and a difficulty level.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player can read and understand the game rules on the home screen without any English-language assistance — verified by the complete absence of English text on all screens.
- **SC-002**: All 3 character cards are visible and interactive on the home screen within 2 seconds of the page loading, on a standard broadband connection.
- **SC-003**: The game board never exceeds 121 tiles in any game session.
- **SC-004**: 100% of board tiles are assigned one of exactly 3 difficulty colors; the distribution is approximately 50% Level 1 (light yellow), 35% Level 2 (peach/salmon), and 15% Level 3 (coral/rose). Level-3 tiles MUST NOT exceed 20% of the total tile count.
- **SC-005**: The board panel occupies at least 60% of the available screen width on a standard desktop viewport (≥ 1024 px wide).
- **SC-006**: Questions are read aloud within 1 second of the question panel appearing, on devices that support audio output.
- **SC-007**: No microphone permission dialog is triggered at any point during a complete game session.
- **SC-008**: A complete game from home screen to win screen contains zero visible English strings.

## Clarifications

### Session 2026-02-26

- Q: What color palette should be used for the 3 board tile difficulty levels? → A: Warm pastels — Level 1 (easy): light yellow, Level 2 (medium): peach/salmon, Level 3 (hard): coral/rose.
- Q: Which famous women should be featured on the 3 character cards? → A: Marie Curie, Rosa Parks, Malala Yousafzai.
- Q: How should biographical information be revealed on touch devices? → A: A persistent ⓘ icon on each card; tap or click opens a bio overlay (works on both desktop and touch).
- Q: What happens when a player navigates back to the home screen mid-game? → A: Full reset — the current game ends and the home screen displays with no cards pre-selected.
- Q: What is the target tile distribution across the 3 difficulty levels? → A: Balanced — approximately 50% Level 1, 35% Level 2, 15% Level 3.

## Assumptions

- The three character cards feature **Marie Curie**, **Rosa Parks**, and **Malala Yousafzai** as placeholder identities. Portrait images are placeholder assets (easily replaceable); biographical texts are short placeholder bios aligned with each woman's historical significance.
- Bio disclosure uses a persistent ⓘ icon (tap/click) on each character card — works on all device types without hover or long-press dependency.
- The existing tile difficulty classification (easy / medium / hard) already exists in the codebase and only needs to be surfaced visually with distinct colors — no changes to question-difficulty logic are required.
- Voice synthesis will fail silently (no error shown to the player) on browsers that do not support the Web Speech Synthesis API, as read-aloud is an accessibility enhancement rather than a game-critical feature.
- German is the only required language for this feature; no multi-language toggle or locale switcher is in scope.
