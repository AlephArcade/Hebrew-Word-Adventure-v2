// gameScreens.js
import { getGameState, startGame } from './gameState.js';
import { renderLives } from './renderGame.js';
import { showMessage } from './animationEffects.js';
import { handleBonusSelection } from './bonusRoundLogic.js';
import { handleLetterSelect, resetSelection } from './wordLogic.js';
import { getHint } from './hintSystem.js';
import { handleDevModeActivation } from './devMode.js';

// Render the start screen
function renderStartScreen(gameContainer) {
  gameContainer.innerHTML = `
    <div class="start-screen">
      <h1>Hebrew Word Adventure</h1>
      <p>Master Hebrew letters by putting them in the right order!</p>
      <p>Includes special Purim words!</p>
      <button class="primary-btn" id="start-btn">START QUEST</button>
    </div>
  `;
  
  // Add event listener for start button
  document.getElementById('start-btn').addEventListener('click', startGame);
  
  // Add secret tap detector for dev mode
  gameContainer.addEventListener('click', handleDevModeActivation);
}

// Render the game completion screen
function renderCompletedScreen(gameContainer) {
  const gameState = getGameState();
  
  // Calculate total words completed
  const totalWordsCompleted = Object.values(gameState.completedWords)
    .reduce((sum, arr) => sum + arr.length, 0);
  
  gameContainer.innerHTML = `
    <div class="complete-screen">
      <h1>🏆 QUEST COMPLETE! 🏆</h1>
      <p>Amazing job! You've mastered ${totalWordsCompleted} Hebrew words!</p>
      <p style="font-size: 24px; margin: 20px 0;">Final Score: <span style="color: #FFEB3B; font-weight: bold;">${gameState.score}</span></p>
      <button class="primary-btn" id="restart-btn">PLAY AGAIN</button>
    </div>
  `;
  
  document.getElementById('restart-btn').addEventListener('click', startGame);
}

// Render the game over screen
function gameOver() {
  const gameState = getGameState();
  
  // Compute total words completed
  const totalCompleted = Object.values(gameState.completedWords)
    .reduce((sum, arr) => sum + arr.length, 0);
  
  showMessage('GAME OVER!');
 
  setTimeout(() => {
    document.querySelector('#game-container').innerHTML = `
      <div class="game-over-screen">
        <h1>GAME OVER</h1>
        <p>Your final score: ${gameState.score}</p>
        <p>Words completed: ${totalCompleted}</p>
        <button class="primary-btn" id="restart-btn">PLAY AGAIN</button>
      </div>
    `;
    document.getElementById('restart-btn').addEventListener('click', startGame);
  }, 1500);
}

// Render the main game screen
function renderGameScreen(gameContainer) {
  const gameState = getGameState();
  
  // Calculate progress for current level
  const wordLength = gameState.level + 1;
  const selectedWordsInLevel = gameState.selectedWordsForLevel[wordLength] || [];
  const totalWordsInLevel = selectedWordsInLevel.length;
  const completedWordsInLevel = gameState.completedWords[wordLength].length;
  const progressPercentage = (completedWordsInLevel / totalWordsInLevel) * 100;

  // Create HTML for letter tiles
  let letterTilesHTML = '';
  for (let i = 0; i < gameState.shuffledLetters.length; i++) {
    // Skip this letter if it's already been used for a completed word part
    if (gameState.completedLetters.includes(i)) continue;
    
    const letter = gameState.shuffledLetters[i];
    const isSelected = gameState.selectedLetters.includes(i);
    const selectionOrder = gameState.selectedLetters.indexOf(i) + 1;
    
    letterTilesHTML += `
      <div class="letter-tile ${isSelected ? 'selected' : ''} ${gameState.partialWordCompleted && isSelected ? 'partial-correct-animation' : ''}" 
           data-index="${i}">
        ${letter}
        ${isSelected ? `<div class="order-indicator">${selectionOrder}</div>` : ''}
      </div>
    `;
  }

  // Check if we have multiple word parts
  const isMultiWord = gameState.currentWordParts.length > 1;
  
  // Container class for vertical layout if needed
  const slotsContainerClass = isMultiWord ? 'answer-slots-vertical' : '';
  
  // Create answer slots for each part of the phrase
  let answerSlotsHTML = '';
  
  // Loop through all word parts
  gameState.currentWordParts.forEach((wordPart, partIndex) => {
    // Create row container for each word part
    answerSlotsHTML += `<div class="answer-word-row">`;
    
    // Create slots for this word part
    const isCurrentPart = partIndex === gameState.currentPartIndex;
    const isCompletedPart = partIndex < gameState.currentPartIndex;
    
    // For each letter in this word part
    for (let i = 0; i < wordPart.length; i++) {
      let slotContent = '';
      
      if (isCompletedPart) {
        // For completed word parts, show the actual letter
        slotContent = wordPart[i];
      } else if (isCurrentPart && gameState.selectedLetters.length > i) {
        // For current word part, show selected letters
        const selectedIndex = gameState.selectedLetters[i];
        slotContent = gameState.shuffledLetters[selectedIndex];
      }
      
      // Determine appropriate class
      let slotClass = isCurrentPart ? 'current-part' : '';
      slotClass += isCompletedPart ? ' completed-part' : '';
      
      // Add the slot
      answerSlotsHTML += `
        <div class="answer-slot ${slotClass}">
          ${slotContent}
        </div>
      `;
    }
    
    // Close row container
    answerSlotsHTML += `</div>`;
  });

  // Create streak stars
  let streakStars = '';
  for (let i = 0; i < 3; i++) {
    streakStars += `<span class="streak-star" ${!(gameState.bonusActive || i < gameState.streak) ? 'style="opacity: 0.3"' : ''}>★</span>`;
  }

  // Instructions (only on first word, but always keep the div for consistent layout)
  const instructionsHTML = gameState.wordsCompleted === 0
    ? `<div class="instructions">Tap the letters in order to spell the Hebrew word</div>`
    : `<div class="instructions">&nbsp;</div>`;
    
  // Bonus indicator
  const bonusHTML = gameState.bonusActive
    ? `<div class="streak-bonus">x1.5</div>`
    : '';
  
  // Render game screen
  gameContainer.innerHTML = `
    <!-- Hearts at top right -->
    <div class="lives-container">
      <div class="hearts-display">
        ${renderLives()}
      </div>
    </div>
    
    <!-- Game content starts here -->
    <div class="game-content-wrapper">
      <div class="word-to-find">
        ${gameState.currentWord.transliteration.toUpperCase()}
      </div>
      
      <div class="word-meaning">
        ${gameState.currentWord.meaning}
      </div>
     
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-label">LEVEL</div>
          <div class="level-badge">${gameState.level}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">SCORE</div>
          <div class="stat-value">${gameState.score}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">STREAK</div>
          <div class="stat-value streak-value">
            ${streakStars}
            ${bonusHTML}
          </div>
        </div>
      </div>
     
      <div class="progress-wrapper">
        <div class="progress-inner">
          <div class="stat-label">PROGRESS ${completedWordsInLevel}/${totalWordsInLevel}</div>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
      </div>
      
      <div class="letter-grid ${wordLength >= 8 ? 'nine-letter' : (wordLength >= 7 ? 'seven-letter' : (wordLength >= 5 ? 'six-letter' : (wordLength >= 4 ? 'five-letter' : '')))}">
        ${letterTilesHTML}
      </div>
         
      <div class="answer-slots ${slotsContainerClass}">
        ${answerSlotsHTML}
      </div>
              
      <div class="controls">
        <button class="icon-button reset-btn" id="reset-btn" title="Reset">
          <svg viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        
        <button class="icon-button hint-btn ${gameState.hintsRemaining <= 0 || gameState.animatingCorrect || gameState.partialWordCompleted ? 'disabled' : ''}" id="hint-btn" title="Get Hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
            <path d="M12 2v1"/>
            <path d="M12 7v1"/>
            <path d="M5.6 5.6l.7.7"/>
            <path d="M18.4 5.6l-.7.7"/>
            <path d="M16.5 13a4.5 4.5 0 10-9 0 4 4 0 002 3.5v1a2.5 2.5 0 005 0v-1c1.2-.8 2-2.1 2-3.5z" fill="#FFEB3B" stroke="#FFC107"/>
          </svg>
          <div class="hint-count">${gameState.hintsRemaining}</div>
        </button>
      </div>
      
      ${instructionsHTML}
      
      <div class="message"></div>
    </div>
  `;
  
  // Add event listeners to letter tiles
  document.querySelectorAll('.letter-tile').forEach(tile => {
    const index = parseInt(tile.dataset.index);
    tile.addEventListener('click', () => handleLetterSelect(index));
    tile.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleLetterSelect(index);
    });
  });
  
  // Add button event listeners
  document.getElementById('reset-btn').addEventListener('click', resetSelection);
  document.getElementById('hint-btn').addEventListener('click', getHint);
}

// Render the bonus round screen
function renderBonusRound(gameContainer) {
  const gameState = getGameState();
  const challenge = gameState.currentBonusChallenge;
  
  // Use the pre-shuffled options from gameState
  let optionsHTML = '';
  gameState.shuffledBonusOptions.forEach(option => {
    optionsHTML += `
      <button class="bonus-option" data-option="${option}">
        ${option}
      </button>
    `;
  });

  gameContainer.innerHTML = `
    <div class="bonus-container">
      <div class="bonus-header">
        <h2>BONUS ROUND!</h2>
        <div class="bonus-timer">
          <svg viewBox="0 0 36 36">
            <path d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#FFF8E1"
              stroke-width="1"
              stroke-dasharray="100, 100"
            />
            <path d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#FFEB3B"
              stroke-width="2"
              stroke-dasharray="${gameState.bonusTimeRemaining * 10}, 100"
            />
          </svg>
          <div class="time-display">${gameState.bonusTimeRemaining}</div>
        </div>
      </div>
      
      <div class="bonus-instruction">
        Select the correct pronunciation of this Hebrew letter
      </div>
      
      <div class="bonus-nikud">
        ${challenge.letter}
      </div>
      
      <div class="bonus-sound-info">
        <span class="sound-name">${challenge.sound}</span>
        <!-- Transliteration explanation is intentionally hidden here -->
      </div>
      
      <div class="bonus-options">
        ${optionsHTML}
      </div>
      
      <div class="message"></div>
    </div>
  `;

  // Add event listeners to bonus option buttons
  document.querySelectorAll('.bonus-option').forEach(button => {
    const option = button.dataset.option;
    button.addEventListener('click', () => handleBonusSelection(option));
  });
}

export {
  renderStartScreen,
  renderCompletedScreen,
  renderGameScreen,
  renderBonusRound,
  gameOver
};
