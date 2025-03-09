# Hebrew Word Adventure

A modular JavaScript game to help learn Hebrew words through an engaging interactive experience. Players unscramble letters to form Hebrew words and phrases, with progressive difficulty levels and special bonus rounds.

## Project Structure

The project is organized into a modular architecture for better maintainability:

### Data Modules
- `wordData.js` - Contains the Hebrew word banks
- `nikudData.js` - Contains the nikud challenge data for bonus rounds

### Game Logic Modules
- `gameState.js` - Manages game state and initialization
- `wordLogic.js` - Handles word selection, checking answers, multi-word phrases
- `bonusRoundLogic.js` - Handles bonus round functionality
- `hintSystem.js` - Handles the hint functionality

### UI Modules
- `renderGame.js` - Main rendering controller
- `gameScreens.js` - Different game screens (start, game, completed)
- `animationEffects.js` - Visual effects (confetti, highlighting)
- `devMode.js` - Developer mode functionality

### Main App
- `main.js` - Entry point, initialization and event listeners

## How to Run

1. Place all JavaScript modules in a `/js` directory
2. Open `index.html` in a web browser
3. Click "START QUEST" to begin the game

## Game Features

- Progressive difficulty levels (2-letter to 9-letter words)
- Multi-word phrases in higher levels
- Bonus rounds testing nikud (Hebrew vowel) knowledge
- Heart-based lives system
- Score and streak multipliers
- Hint system
- Celebratory animations

## Developer Mode

For testing purposes, you can activate developer mode by tapping the title screen 5 times rapidly. This allows:
- Skipping to any level
- Adding hints
- Restoring health

## Browser Compatibility

This game uses ES6 modules and modern JavaScript features. It requires a modern browser like Chrome, Firefox, Safari, or Edge to run properly.

## Project Notes

- The game includes special Purim-themed words
- The modular structure makes it easy to extend with new features
- All rendering is done dynamically through JavaScript
