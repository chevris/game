# Spiral Quiz Game

A multiplayer turn-based quiz game featuring a spiral board path, German history and geography questions, and voice recognition support.

## Features

- **Spiral Board**: Clockwise spiral path from outer edge to center
- **Multiplayer Support**: 1-4 players in hot-seat mode
- **Dynamic Difficulty**: Questions get harder as you approach the center
- **Voice Recognition**: Answer questions using voice commands (A, B, C) with button fallback
- **Text-to-Speech**: Questions read aloud in German
- **Unique Questions**: No question repeats per player; players on same cell get different questions

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Play

1. **Setup**: Select number of players (1-4) and board size (5-21, odd numbers only)
2. **Answer Questions**: Each turn, answer a German history or geography question
3. **Roll Dice**: If correct, roll a die (1-6) to move forward on the spiral
4. **Win**: First player to reach the center wins!

## Voice Recognition

- **Chrome/Edge**: Full support for voice input and text-to-speech
- **Firefox/Safari**: Limited support - button fallback available
- **Permissions**: Grant microphone access when prompted for voice input

## Game Rules

- Only correct answers earn dice rolls
- Incorrect answers end your turn
- Players start at position 0 (outer edge)
- First to reach the center (index 60 for 11x11 board) wins
- Questions scale in difficulty based on position (5 levels)
- No question repeats for the same player

## Technical Stack

- **React** 19.2.0
- **Vite** 7.3.1
- **Zustand** (State Management)
- **Web Speech API** (Voice Recognition & TTS)
- **JavaScript** (No TypeScript per project constitution)

## Project Structure

```
src/
├── components/          # React UI components
│   ├── GameBoard.jsx   # Spiral grid visualization
│   ├── GameSetup.jsx   # Player & board size selection
│   ├── QuestionPanel.jsx # Question display & answer input
│   ├── DiceRoller.jsx  # Dice animation & rolling
│   ├── TurnIndicator.jsx # Current player & stats
│   └── WinScreen.jsx   # Victory screen
├── store/              # Zustand state management
│   └── gameStore.js    # Global game state & actions
├── engine/             # Pure game logic (no React)
│   ├── spiralGenerator.js # Spiral path algorithm
│   ├── movementEngine.js  # Player movement logic
│   ├── questionSelector.js # Question selection with uniqueness
│   ├── difficultyMapper.js # Position-based difficulty
│   └── victoryChecker.js  # Win condition checker
├── hooks/              # Custom React hooks
│   ├── useSpeechSynthesis.js # Text-to-speech
│   └── useSpeechRecognition.js # Voice input
├── utils/              # Helper utilities
│   └── constants.js    # Game constants
└── App.jsx             # Main app component
```

## Constitution Compliance

This project follows strict architectural principles:

- ✅ **No Backend**: Client-side only, no API server
- ✅ **No Persistence**: In-memory state only (refresh resets game)
- ✅ **No Testing Framework**: Manual testing only
- ✅ **JavaScript Only**: No TypeScript
- ✅ **Separation of Concerns**: Game logic separated from UI
- ✅ **MVP-First**: Simple, readable code with no premature optimization

## Browser Compatibility

- **Chrome/Edge**: Full support (voice + TTS)
- **Firefox**: Partial support (TTS only, no voice recognition)
- **Safari**: Partial support (limited voice features)

## License

MIT

## Specification

Full feature specification available in [specs/001-spiral-quiz-game/](specs/001-spiral-quiz-game/)
