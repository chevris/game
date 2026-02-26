/**
 * Game constants - centralized magic numbers
 */

export const MAX_PLAYERS = 3;
export const MIN_PLAYERS = 1;

export const DEFAULT_BOARD_SIZE = 7;
export const MIN_BOARD_SIZE = 5;
export const MAX_BOARD_SIZE = 7;

export const DICE_SIDES = 6;
export const MIN_DICE_ROLL = 1;
export const MAX_DICE_ROLL = 6;

export const DIFFICULTY_LEVELS = 3;
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 3;

// Difficulty thresholds (percentage of board completion)
export const DIFFICULTY_THRESHOLDS = {
  1: 0.17,   // 0-17%
  2: 0.41,   // 18-41%
  3: 0.66,   // 42-66%
  4: 0.83,   // 67-83%
  5: 1.00    // 84-100%
};

// Player colors
export const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];

// Answer options
export const ANSWER_OPTIONS = ['A', 'B', 'C'];

// Game status
export const GAME_STATUS = {
  SETUP: 'setup',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Timing constants (milliseconds)
export const TURN_TRANSITION_DELAY = 1500;
export const DICE_ANIMATION_DELAY = 500;
export const QUESTION_PRESENTATION_DELAY = 100;
export const TTS_START_DELAY = 1000;

// Question categories
export const QUESTION_CATEGORIES = ['history', 'geography'];
