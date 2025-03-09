// hintSystem.js
import { getGameState, updateGameState } from './gameState.js';
import { renderGame } from './renderGame.js';
import { showMessage } from './animationEffects.js';

// Function to get hint for current word
function getHint() {
  const gameState = getGameState();
  
  if (gameState.hintsRemaining <= 0 || gameState.animatingCorrect || gameState.partialWordCompleted) return;
  
  // Find the next letter position that needs to be filled
  let nextLetterPosition = 0;
  
  // Get the current word part we're working on
  const currentWordPart = gameState.currentWordParts[gameState.currentPartIndex];
  
  // If the user has selected letters and they are correct, hint for the next position
  if (gameState.selectedLetters.length > 0) {
    // Check if the selected letters are correct so far
    const selectedWord = gameState.selectedLetters.map(idx => gameState.shuffledLetters[idx]).join('');
    const targetWordStart = currentWordPart.substring(0, gameState.selectedLetters.length);
    
    if (selectedWord === targetWordStart) {
      // Selected letters are correct, hint for the next position
      nextLetterPosition = gameState.selectedLetters.length;
    } else {
      // Selected letters are incorrect, hint for the first position
      nextLetterPosition = 0;
      // Clear incorrect selections before showing the hint
      updateGameState({ selectedLetters: [] });
    }
  }
  
  // If all letters for current word part are already selected, no hint needed
  if (nextLetterPosition >= currentWordPart.length) return;
  
  // Get the correct letter for the next position
  const correctLetter = currentWordPart[nextLetterPosition];
  
  // Find this letter in the shuffled array that's not already selected
  // and not part of completed words
  const hintIndex = gameState.shuffledLetters.findIndex((letter, idx) =>
    letter === correctLetter && 
    !gameState.selectedLetters.includes(idx) &&
    !gameState.completedLetters.includes(idx)
  );
  
  if (hintIndex !== -1) {
    // Add this letter to the selection and reduce hints
    const newSelectedLetters = [...gameState.selectedLetters, hintIndex];
    const newScore = Math.max(0, gameState.score - 5); // Penalty for using a hint
    
    updateGameState({
      selectedLetters: newSelectedLetters,
      hintsRemaining: gameState.hintsRemaining - 1,
      score: newScore
    });
    
    // Get updated state
    const updatedState = getGameState();
    
    // Customize message based on multi-word status
    if (updatedState.currentWordParts.length > 1) {
      showMessage(`Hint: Letter ${nextLetterPosition + 1} of word ${updatedState.currentPartIndex + 1} selected`);
    } else {
      showMessage(`Hint: Letter ${nextLetterPosition + 1} selected`);
    }
    
    renderGame();
    
    // If all letters for current word part are now selected, check the answer
    if (updatedState.selectedLetters.length === currentWordPart.length) {
      // Import these functions dynamically to avoid circular dependencies
      import('./wordLogic.js').then(({ checkPartialAnswer, checkAnswer }) => {
        if (updatedState.currentWordParts.length > 1 && updatedState.currentPartIndex < updatedState.currentWordParts.length - 1) {
          checkPartialAnswer();
        } else {
          checkAnswer();
        }
      });
    }
  }
}

export { getHint };
