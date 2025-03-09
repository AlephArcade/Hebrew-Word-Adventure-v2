// bonusRoundLogic.js
import { nikudChallenges } from './nikudData.js';
import { getGameState, updateGameState } from './gameState.js';
import { renderGame } from './renderGame.js';
import { showMessage, createConfetti } from './animationEffects.js';
import { setupWord } from './wordLogic.js';
import { shuffleArray } from './wordLogic.js';

// Start a bonus round
function startBonusRound() {
  // Set up bonus round state
  updateGameState({
    inBonusRound: true,
    bonusTimeRemaining: 10 // 10 seconds for bonus round
  });
  
  const gameState = getGameState();
  
  // Choose a random nikud challenge based on current level
  // Use the current level's challenges, or level 6 challenges if level > 6
  const challengeLevel = Math.min(gameState.level - 1, nikudChallenges.length - 1);
  const levelChallenges = nikudChallenges[challengeLevel];
  const randomIndex = Math.floor(Math.random() * levelChallenges.length);
  const currentBonusChallenge = levelChallenges[randomIndex];
  
  // Shuffle the options ONCE at the start and store in game state
  const shuffledBonusOptions = shuffleArray([...currentBonusChallenge.options]);
  
  // Update game state with challenge data
  updateGameState({
    currentBonusChallenge,
    shuffledBonusOptions
  });
  
  // Start the timer
  const bonusTimer = setInterval(() => {
    const currentState = getGameState();
    const newTimeRemaining = currentState.bonusTimeRemaining - 1;
    
    updateGameState({ bonusTimeRemaining: newTimeRemaining });
    
    if (newTimeRemaining <= 0) {
      clearInterval(bonusTimer);
      endBonusRound(false); // Timeout
    }
    renderGame(); // Update the timer display
  }, 1000);
  
  // Store timer ID in window to allow clearing from anywhere
  window.bonusTimer = bonusTimer;
  
  renderGame();
}

// Handle bonus round answer selection
function handleBonusSelection(selected) {
  const gameState = getGameState();
  
  // Stop the timer
  clearInterval(window.bonusTimer);
  
  const isCorrect = selected === gameState.currentBonusChallenge.correct;
  
  if (isCorrect) {
    // Apply rewards
    updateGameState({
      bonusReward: {
        ...gameState.bonusReward,
        extraHints: gameState.bonusReward.extraHints + 3
      },
      hintsRemaining: gameState.hintsRemaining + 3,
      score: gameState.score + 30
    });
    
    showMessage('CORRECT! +30 points and 3 bonus hints!');
    createConfetti();
    
    // End the bonus round after a brief delay
    setTimeout(() => {
      endBonusRound(true);
    }, 1500);
  } else {
    // Wrong answer: Show feedback with transliteration explanation
    document.querySelector('#game-container').innerHTML = `
      <div class="bonus-feedback">
        <p>Not quite right!</p>
        <p>Hint: ${gameState.currentBonusChallenge.transliteration}</p>
        <button id="continue-btn" class="primary-btn">Continue</button>
      </div>
    `;
    
    document.getElementById('continue-btn').addEventListener('click', () => {
      endBonusRound(false);
    });
  }
}

// End the bonus round and move to the next level
function endBonusRound(wasSuccessful) {
  // Clear timer if it's still running
  if (window.bonusTimer) {
    clearInterval(window.bonusTimer);
    window.bonusTimer = null;
  }
  
  const gameState = getGameState();
  
  // Update game state to end bonus round
  updateGameState({
    inBonusRound: false,
    level: gameState.level + 1
  });
  
  const updatedState = getGameState();
  
  // Check if we've reached beyond the maximum level
  if (updatedState.level > 9) {
    // Set completed flag to true for game completion
    updateGameState({ completed: true });
    renderGame(); // Show completion screen
    return;
  }
  
  // Otherwise, continue with normal level progression
  updateGameState({ currentLevelProgress: 0 });
  showMessage(`LEVEL UP! Now playing with ${getWordLengthForLevel(updatedState.level)} letter words!`);
  
  // Set up new word for the next level
  setupWord();
}

export {
  startBonusRound,
  handleBonusSelection,
  endBonusRound
};
