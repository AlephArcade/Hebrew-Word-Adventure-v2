// main.js - Entry point for the application
import { renderGame } from './renderGame.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the gameContainer
  const gameContainer = document.getElementById('game-container');
  
  if (!gameContainer) {
    console.error('Could not find game-container element!');
    return;
  }
  
  // Initial render to show the start screen
  renderGame();
});
