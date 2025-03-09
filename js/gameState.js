// gameState.js
import { setupWord } from './wordLogic.js';

// Default initial game state
const initialGameState = {
  active: false,
  level: 1,
  currentWord: null,
  shuffledLetters: [],
  selectedLetters: [],
  score: 0,
  streak: 0,
  bonusActive: false,
  hintsRemaining: 5,
  completed: false,
  animatingCorrect: false,
  wordsCompleted: 0,
  completedWords: {
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: []
  },
  currentLevelProgress: 0,
  inBonusRound: false,
  bonusTimeRemaining: 0,
  bonusReward: {
    extraHints: 0,
    scoreMultiplier: 1
  },
  lives: 10, // 10 lives = 5 hearts
  maxLives: 10, // Maximum number of lives
  shuffledBonusOptions: [], // For storing randomized bonus options
  // Multi-word support properties
  currentWordParts: [], // Array of individual words in the phrase
  currentPartIndex: 0,  // Which word we're currently solving (0=first, 1=second)
  completedLetters: [], // Letters already used in completed words
  partialWordCompleted: false, // Flag for animation between words
  selectedWordsForLevel: {}
};

// Declare gameState as a module variable
let gameState = { ...initialGameState };

// Function to start/reset the game
function startGame() {
  // Reset to initial state
  gameState = {
    active: true,
    level: 1,
    currentWord: null,
    shuffledLetters: [],
    selectedLetters: [],
    score: 0,
    streak: 0,
    bonusActive: false,
    : 5,
    completed: false,
    animatingCorrect: false,
    wordsCompleted: 0,
    completedWords: {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    },
    currentLevelProgress: 0,
    inBonusRound: false,
    bonusTimeRemaining: 0,
    bonusReward: {
      extraHints: 0,
      scoreMultiplier: 1
    },
    lives: 10,
    maxLives: 10,
    shuffledBonusOptions: [],
    // Multi-word support properties
    currentWordParts: [],
    currentPartIndex: 0,
    completedLetters: [],
    partialWordCompleted: false,
    selectedWordsForLevel: {} // Initialize the selected words property
  };

  // Setup the first word
  setupWord();
}

// Function to get the current game state
function getGameState() {
  return gameState;
}

// Function to update the game state
function updateGameState(newState) {
  gameState = { ...gameState, ...newState };
  return gameState;
}

// Helper function to get word length for current level
function getWordLengthForLevel(level) {
  return level + 1; // Level 1 = 2-letter words, Level 8 = 9-letter words
}

// Export functions and state
export { 
  getGameState, 
  updateGameState, 
  startGame, 
  getWordLengthForLevel 
};
