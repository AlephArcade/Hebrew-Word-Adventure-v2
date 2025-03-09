// devMode.js
import { getGameState, updateGameState } from './gameState.js';
import { setupWord } from './wordLogic.js';
import { renderGame } from './renderGame.js';
import { wordBanks } from './wordData.js'; // Direct import instead of require

// Dev mode state variables
let devModeClickCounter = 0;
let devModeTimer = null;
let inDevMode = false;

// Function to handle developer mode activation
function handleDevModeActivation(e) {
  const gameState = getGameState();
  
  // Only activate on title screen
  if (gameState.active) return;
  
  // Reset timer on each click
  clearTimeout(devModeTimer);
  
  // Increment counter
  devModeClickCounter++;
  
  // Set timer to reset counter after 2 seconds of inactivity
  devModeTimer = setTimeout(() => {
    devModeClickCounter = 0;
  }, 2000);
  
  // Check if we've reached the required number of clicks (5)
  if (devModeClickCounter >= 5) {
    devModeClickCounter = 0;
    clearTimeout(devModeTimer);
    showDevModeScreen();
  }
}

// Function to show developer mode screen
function showDevModeScreen() {
  inDevMode = true;
  const gameContainer = document.querySelector('#game-container');
  
  // Create the level selection interface
  let levelButtonsHTML = '';
  
  // Create buttons for each level (1-9)
  for (let i = 1; i <= 9; i++) {
    const wordLength = i + 1; // Level 1 = 2-letter words, etc.
    const wordsInLevel = getWordBankCount(wordLength);
    
    levelButtonsHTML += `
      <div class="dev-level-btn" data-level="${i}">
        <span class="level-number">Level ${i}</span>
        <span class="level-info">${wordLength}-letter words (${wordsInLevel})</span>
      </div>
    `;
  }
  
  // Render the developer mode screen
  gameContainer.innerHTML = `
    <div class="dev-mode-screen">
      <h2>Developer Mode</h2>
      <p>Select a level to skip to:</p>
      
      <div class="dev-level-buttons">
        ${levelButtonsHTML}
      </div>
      
      <div class="dev-options">
        <button class="dev-option-btn" id="add-hints-btn">+ 10 Hints</button>
        <button class="dev-option-btn" id="full-health-btn">Restore Health</button>
      </div>
      
      <button class="primary-btn" id="dev-back-btn">Back to Game</button>
    </div>
  `;
  
  // Add event listeners to level buttons
  document.querySelectorAll('.dev-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = parseInt(btn.dataset.level);
      skipToLevel(level);
    });
  });
  
  // Add hint button listener
  document.getElementById('add-hints-btn').addEventListener('click', () => {
    const currentState = getGameState();
    updateGameState({ hintsRemaining: currentState.hintsRemaining + 10 });
    showDevMessage('Added 10 hints');
  });
  
  // Add health button listener
  document.getElementById('full-health-btn').addEventListener('click', () => {
    const currentState = getGameState();
    updateGameState({ lives: currentState.maxLives });
    showDevMessage('Health restored');
  });
  
  // Add back button listener
  document.getElementById('dev-back-btn').addEventListener('click', () => {
    inDevMode = false;
    renderGame();
  });
}

// Function to get the count of words in a word bank
function getWordBankCount(wordLength) {
  // Use imported wordBanks directly
  return wordBanks[wordLength] ? wordBanks[wordLength].length : 0;
}

// Function to skip to a specific level
function skipToLevel(level) {
  const gameState = getGameState();
  
  if (!gameState.active) {
    // If game hasn't started yet, initialize it first
    updateGameState({ active: true });
  }
  
  // Set the selected level
  updateGameState({
    level: level,
    currentLevelProgress: 0,
    selectedWordsForLevel: {},  // Reset level-specific data
    completedWords: {           // Reset completed words
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    }
  });
  
  // Show success message
  showDevMessage(`Skipped to Level ${level}`);
  
  // Setup a new word for this level
  setupWord();
  
  // Exit dev mode
  inDevMode = false;
}

// Show a temporary message for dev mode actions
function showDevMessage(message) {
  const devMessage = document.createElement('div');
  devMessage.className = 'dev-message';
  devMessage.textContent = message;
  document.body.appendChild(devMessage);
  
  setTimeout(() => {
    if (devMessage.parentNode) {
      devMessage.parentNode.removeChild(devMessage);
    }
  }, 2000);
}

// Check if dev mode is active
function isInDevMode() {
  return inDevMode;
}

export {
  handleDevModeActivation,
  showDevModeScreen,
  showDevMessage,
  isInDevMode
};
