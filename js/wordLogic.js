// wordLogic.js
import { wordBanks } from './wordData.js';
import { getGameState, updateGameState, getWordLengthForLevel } from './gameState.js';
import { renderGame } from './renderGame.js';
import { showMessage, createConfetti, highlightWrongSequence, showCorrectAnimation } from './animationEffects.js';
import { startBonusRound } from './bonusRoundLogic.js';
import { gameOver } from './gameScreens.js';

// Function to shuffle an array
function shuffleArray(array) {
  // Clone the array to avoid modifying the original
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Function to select random words for a level (max 10)
function selectRandomWordsForLevel(level) {
  const wordLength = getWordLengthForLevel(level);
  const allWordsForLevel = wordBanks[wordLength];
  
  // If there are 10 or fewer words in total, use all of them
  if (allWordsForLevel.length <= 10) {
    return [...allWordsForLevel];
  }
  
  // Otherwise, randomly select 10 words
  const selectedWords = [];
  const indices = new Set();
  
  while (selectedWords.length < 10) {
    const randomIndex = Math.floor(Math.random() * allWordsForLevel.length);
    
    // Only add each word once
    if (!indices.has(randomIndex)) {
      indices.add(randomIndex);
      selectedWords.push(allWordsForLevel[randomIndex]);
    }
  }
  
  return selectedWords;
}

// Modified setupWord function to handle multi-word phrases
function setupWord() {
  const gameState = getGameState();
  const wordLength = getWordLengthForLevel(gameState.level);
  const wordsForLevel = wordBanks[wordLength];

  // Update game state with selected words for this level if needed
  if (!gameState.selectedWordsForLevel[wordLength]) {
    const selectedWordsForLevel = {...gameState.selectedWordsForLevel};
    selectedWordsForLevel[wordLength] = selectRandomWordsForLevel(gameState.level);
    updateGameState({ selectedWordsForLevel });
  }
  
  // Get the current game state after possible update
  const updatedGameState = getGameState();
  
  // Get words that haven't been completed yet
  const availableWords = updatedGameState.selectedWordsForLevel[wordLength].filter(word =>
    !updatedGameState.completedWords[wordLength].includes(word.hebrew || word.phrase)
  );
  
  // If no words left at this level
  if (availableWords.length === 0) {
    // Move to next level if available
    if (updatedGameState.level < 9) { // Now go up to level 9
      updateGameState({
        level: updatedGameState.level + 1,
        currentLevelProgress: 0
      });
      showMessage(`LEVEL UP! Now playing with ${getWordLengthForLevel(getGameState().level)} letter words!`);
      // Recursive call to set up a word in the new level
      setupWord();
      return;
    } else {
      // Game completed
      updateGameState({ completed: true });
      renderGame();
      return;
    }
  }
  
  // Select random word from available words
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const currentWord = availableWords[randomIndex];
  
  // For multi-word phrases, track individual words
  const currentWordParts = currentWord.hebrew ? 
    currentWord.hebrew.split(' ') : 
    currentWord.phrase.split(' ');
  
  // Shuffle letters for current word/phrase (no spaces for shuffling)
  const textToShuffle = currentWord.hebrew || currentWord.phrase;
  const lettersArray = textToShuffle.replace(/\s+/g, '').split('');
  const shuffledLetters = shuffleArray(lettersArray);
  
  // Update game state with new word data
  updateGameState({
    currentWord,
    currentWordParts,
    currentPartIndex: 0,
    shuffledLetters,
    selectedLetters: [],
    completedLetters: [],
    animatingCorrect: false,
    partialWordCompleted: false,
    bonusActive: updatedGameState.streak >= 3
  });
  
  renderGame();
}

// Handle letter selection
function handleLetterSelect(index) {
  const gameState = getGameState();
  
  // Don't allow selection during animations
  if (gameState.animatingCorrect || gameState.partialWordCompleted) return;
  
  // Check if already selected
  if (gameState.selectedLetters.includes(index)) {
    // If this is the last letter selected, deselect it
    if (gameState.selectedLetters[gameState.selectedLetters.length - 1] === index) {
      const newSelectedLetters = [...gameState.selectedLetters];
      newSelectedLetters.pop();
      updateGameState({ selectedLetters: newSelectedLetters });
      renderGame();
    }
    return;
  }
  
  // Check if this letter is part of completed words
  if (gameState.completedLetters.includes(index)) return;
  
  // Add letter to selection
  const newSelectedLetters = [...gameState.selectedLetters, index];
  updateGameState({ selectedLetters: newSelectedLetters });
  
  // Get current word part length
  const currentWordLength = gameState.currentWordParts[gameState.currentPartIndex].length;
  
  // Check if selection is complete for current word part
  if (newSelectedLetters.length === currentWordLength) {
    if (gameState.currentWordParts.length > 1 && gameState.currentPartIndex < gameState.currentWordParts.length - 1) {
      // For multi-word phrases, check each word separately
      checkPartialAnswer();
    } else {
      // For single words, check the full answer
      checkAnswer();
    }
  } else {
    renderGame();
  }
}

// Show animation for partial word completion
function showCorrectPartialWordAnimation() {
  // Re-render to show all selected letters
  renderGame();
  
  // Apply animations to the selected letters
  setTimeout(() => {
    // Animate the selected letter tiles
    const tiles = document.querySelectorAll('.letter-tile.selected');
    tiles.forEach(tile => {
      tile.classList.add('partial-correct-animation');
    });
    
    // Animate the slots for the current word
    const slots = document.querySelectorAll('.answer-slot.current-part');
    slots.forEach((slot, index) => {
      setTimeout(() => {
        slot.classList.add('correct');
      }, index * 150); // Staggered animation
    });
  }, 100);
}

// Check partial answers (first word in multi-word phrase)
function checkPartialAnswer() {
  const gameState = getGameState();
  
  // Build the selected word
  const selectedWord = gameState.selectedLetters.map(idx => gameState.shuffledLetters[idx]).join('');
  const targetWord = gameState.currentWordParts[gameState.currentPartIndex];
  
  if (selectedWord === targetWord) {
    // First word is correct
    updateGameState({ partialWordCompleted: true });
    showCorrectPartialWordAnimation();
    
    // Show message for first word
    showMessage(`First word correct: "${targetWord}"!`);
    
    // After animation completes, move to the next word
    setTimeout(() => {
      // Store completed letters
      const newCompletedLetters = [...gameState.completedLetters, ...gameState.selectedLetters];
      
      // Update game state to move to next word part
      updateGameState({
        completedLetters: newCompletedLetters,
        currentPartIndex: gameState.currentPartIndex + 1,
        selectedLetters: [],
        partialWordCompleted: false
      });
      
      // Get updated state
      const updatedState = getGameState();
      
      // If all word parts are completed, check the entire phrase
      if (updatedState.currentPartIndex >= updatedState.currentWordParts.length) {
        checkAnswer(); // The whole phrase is completed
      } else {
        // Continue with next word
        renderGame();
      }
    }, 1500); // Time for animation to complete
  } else {
    // First word is incorrect
    const newLives = Math.max(0, gameState.lives - 1);
    
    updateGameState({
      lives: newLives,
      streak: 0,
      bonusActive: false
    });
    
    if (newLives <= 0) {
      gameOver();
      return;
    }
    
    showMessage('Try again! Lost 1 life.');
    highlightWrongSequence();
    
    // Reset selection for current word part only
    setTimeout(() => {
      updateGameState({ selectedLetters: [] });
      renderGame();
    }, 1000);
  }
}

// Function to reset currently selected letters
function resetSelection() {
  const gameState = getGameState();
  if (gameState.animatingCorrect || gameState.partialWordCompleted) return;
  updateGameState({ selectedLetters: [] });
  renderGame();
}

// Check final answer
function checkAnswer() {
  const gameState = getGameState();
  
  // For multi-word phrases that have already validated individual words
  if (gameState.currentWordParts.length > 1 && gameState.currentPartIndex >= gameState.currentWordParts.length) {
    // All words have been validated, mark as complete
    handleCorrectAnswer();
    return;
  }
  
  // For single words or the last word of a phrase
  // Build the word from selected letters
  const selectedWord = gameState.selectedLetters.map(idx => gameState.shuffledLetters[idx]).join('');
  
  // Check if correct
  if (selectedWord === (gameState.currentWord.hebrew || '').replace(/\s+/g, '') || 
      selectedWord === gameState.currentWordParts[gameState.currentPartIndex]) {
    handleCorrectAnswer();
  } else {
    // Incorrect
    const newLives = Math.max(0, gameState.lives - 1);
    
    updateGameState({
      lives: newLives,
      streak: 0,
      bonusActive: false
    });
    
    // Check if game over
    if (newLives <= 0) {
      gameOver();
      return;
    }
    
    showMessage('Try again! Lost 1 life.');
    highlightWrongSequence();
    
    // Reset selection after a delay
    setTimeout(() => {
      updateGameState({ selectedLetters: [] });
      renderGame();
    }, 1000);
  }
}

// Extracted common code for handling correct answers
function handleCorrectAnswer() {
  const gameState = getGameState();
  
  // Mark as animating to prevent further selection
  updateGameState({
    animatingCorrect: true,
    wordsCompleted: gameState.wordsCompleted + 1
  });
  
  // Get the updated state
  const updatedState = getGameState();
  
  // Add to completed words
  const wordLength = getWordLengthForLevel(updatedState.level);
  const completedWords = {...updatedState.completedWords};
  completedWords[wordLength] = [
    ...completedWords[wordLength], 
    updatedState.currentWord.hebrew || updatedState.currentWord.phrase
  ];
  
  // Update level progress
  const selectedWordsCount = updatedState.selectedWordsForLevel[wordLength].length;
  const currentLevelProgress = (completedWords[wordLength].length / selectedWordsCount) * 100;
  
  // Calculate points with bonus if streak is active
  let pointsEarned = wordLength * 10;
  
  // Apply bonus for streaks of 3 or more
  if (updatedState.bonusActive) {
    pointsEarned = Math.round(pointsEarned * 1.5); // 50% bonus
  }
  
  // Update game state with rewards
  updateGameState({
    completedWords,
    currentLevelProgress,
    score: updatedState.score + pointsEarned,
    streak: updatedState.streak + 1
  });
  
  // Get the newly updated state
  const newState = getGameState();
  
  // Update bonus status after increasing streak
  updateGameState({ bonusActive: newState.streak >= 3 });
  
  // Show appropriate message
  if (newState.streak >= 3) {
    showMessage(`+${pointsEarned} points with streak bonus! 🔥`);
  } else {
    showMessage(`AWESOME! +${pointsEarned} points!`);
  }
  
  // Show correct animation and create celebration effect
  showCorrectAnimation();
  createConfetti();
  
  // Check for level completion or next word after animation completes
  setTimeout(() => {
    const finalState = getGameState();
    
    // Check if we've completed all selected words at this level
    const completedAll = finalState.completedWords[wordLength].length >= 
      finalState.selectedWordsForLevel[wordLength].length;
    
    if (completedAll) {
      if (finalState.level < 9) {
        // Instead of immediately going to next level, start a bonus round
        startBonusRound();
      } else {
        // Game complete - all levels finished
        updateGameState({ completed: true });
      }
    } else {
      // If not completed level, set up next word
      if (!finalState.completed) {
        setupWord();
      } else {
        renderGame(); // Show completion screen
      }
    }
  }, 2000);
}

export { 
  setupWord, 
  handleLetterSelect, 
  resetSelection,
  shuffleArray,
  checkPartialAnswer,
  checkAnswer
};
