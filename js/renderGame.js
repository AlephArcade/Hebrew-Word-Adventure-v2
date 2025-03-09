// renderGame.js
import { getGameState } from './gameState.js';
import { isInDevMode } from './devMode.js';
import { 
  renderStartScreen, 
  renderCompletedScreen, 
  renderGameScreen, 
  renderBonusRound 
} from './gameScreens.js';

// Main rendering function
function renderGame() {
  const gameContainer = document.querySelector('#game-container');
  if (!gameContainer) {
    console.error('Could not find game-container element!');
    return;
  }
  
  const gameState = getGameState();
  
  // Don't render if in dev mode
  if (isInDevMode()) return;
  
  if (!gameState.active) {
    renderStartScreen(gameContainer);
  } else if (gameState.completed) {
    renderCompletedScreen(gameContainer);
  } else if (gameState.inBonusRound) {
    renderBonusRound(gameContainer);
  } else {
    renderGameScreen(gameContainer);
  }
}

// Render lives as hearts
function renderLives() {
  const gameState = getGameState();
  const totalHearts = gameState.maxLives / 2; // 5 hearts for 10 lives
  let heartsHTML = '';
  
  for (let i = 0; i < totalHearts; i++) {
    const livesForThisHeart = Math.min(2, Math.max(0, gameState.lives - (i * 2)));
    
    if (livesForThisHeart === 2) {
      // Full heart
      heartsHTML += `
        <div class="heart full-heart">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E91E63"/>
          </svg>
        </div>
      `;
    } else if (livesForThisHeart === 1) {
      // Half heart
      heartsHTML += `
        <div class="heart half-heart">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E91E63" opacity="0.5"/>
            <path d="M7.5,3C4.42,3,2,5.42,2,8.5c0,3.78,3.4,6.86,8.55,11.54L12,21.35V5.09C10.91,3.81,9.24,3,7.5,3z" fill="#E91E63"/>
          </svg>
        </div>
      `;
    } else {
      // Empty heart
      heartsHTML += `
        <div class="heart empty-heart">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#E91E63" stroke-width="1"/>
          </svg>
        </div>
      `;
    }
  }
  
  return heartsHTML;
}

export {
  renderGame,
  renderLives
};
