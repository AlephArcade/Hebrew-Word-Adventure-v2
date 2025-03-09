// animationEffects.js
import { getGameState } from './gameState.js';
import { renderGame } from './renderGame.js';

// Show a message to the user
function showMessage(text) {
  const messageElement = document.querySelector('.message');
  if (messageElement) {
    messageElement.textContent = text;
  }
}

// Create confetti celebration effect
function createConfetti() {
  const celebration = document.createElement('div');
  celebration.className = 'celebration';
  document.body.appendChild(celebration);
  
  // Create confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random position
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '0';
    
    // Random color
    const colors = ['#FFEB3B', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * 10 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    
    // Random shape
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '50%';
    } else {
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    }
    
    // Random animation duration
    confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
    
    // Random delay
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    
    celebration.appendChild(confetti);
  }
  
  // Remove after animation finishes
  setTimeout(() => {
    if (celebration.parentNode) {
      celebration.parentNode.removeChild(celebration);
    }
  }, 3000);
}

// Highlight wrong letter sequence
function highlightWrongSequence() {
  const gameState = getGameState();
  const tiles = document.querySelectorAll('.letter-tile');
  
  gameState.selectedLetters.forEach(index => {
    tiles[index].classList.add('wrong');
  });
}

// Show animation for correct answer
function showCorrectAnimation() {
  // Re-render to show all letters in slots
  renderGame();
  
  // Apply animations to letter tiles and slots
  setTimeout(() => {
    // Animate the selected letter tiles
    const tiles = document.querySelectorAll('.letter-tile.selected');
    tiles.forEach(tile => {
      tile.classList.add('correct-animation');
    });
    
    // Animate the slots
    const slots = document.querySelectorAll('.answer-slot');
    slots.forEach((slot, index) => {
      setTimeout(() => {
        slot.classList.add('correct');
      }, index * 150); // Staggered animation
    });
  }, 100);
}

export {
  showMessage,
  createConfetti,
  highlightWrongSequence,
  showCorrectAnimation
};
