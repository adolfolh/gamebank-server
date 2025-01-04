const seedrandom = require('seedrandom');

// Constants
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const BOARD_SIZE = 6; // Number of colors in solution
const MAX_ATTEMPTS = 8;

class CodeBreakGame {
  constructor(seed) {
    this.rng = seedrandom(seed);
    this.solution = this.generateSolution();
  }

  generateSolution() {
    const solution = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const colorIndex = Math.floor(this.rng() * COLORS.length);
      solution.push(COLORS[colorIndex]);
    }
    return solution;
  }

  checkGuess(guess) {
    if (!this.isValidGuess(guess)) return null;

    // Count exact matches (right color, right position)
    const exactMatches = guess.reduce((count, color, i) => 
      color === this.solution[i] ? count + 1 : count, 0);

    // Count color matches (right color, wrong position)
    const solutionCounts = this.countColors(this.solution);
    const guessCounts = this.countColors(guess);
    
    let colorMatches = COLORS.reduce((count, color) => 
      count + Math.min(solutionCounts[color] || 0, guessCounts[color] || 0), 0);
    
    // Subtract exact matches to avoid double counting
    colorMatches -= exactMatches;

    return {
      exact: exactMatches,
      color: colorMatches
    };
  }

  countColors(colors) {
    return colors.reduce((counts, color) => {
      counts[color] = (counts[color] || 0) + 1;
      return counts;
    }, {});
  }

  isValidGuess(guess) {
    return Array.isArray(guess) && 
           guess.length === BOARD_SIZE &&
           guess.every(color => COLORS.includes(color));
  }

  // Generate a share text like Wordle
  generateShareText(attempts) {
    if (!Array.isArray(attempts)) return '';

    const date = new Date().toLocaleDateString();
    const success = attempts.some(attempt => 
      this.checkGuess(attempt).exact === BOARD_SIZE);

    let text = `Code Break ${date}\n`;
    text += `${success ? attempts.length : 'X'}/${MAX_ATTEMPTS}\n\n`;

    // Generate emoji grid
    attempts.forEach(attempt => {
      const result = this.checkGuess(attempt);
      let row = '';
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (attempt[i] === this.solution[i]) {
          row += '🟩'; // Exact match
        } else if (this.solution.includes(attempt[i])) {
          row += '🟨'; // Color match
        } else {
          row += '⬛'; // No match
        }
      }
      text += row + '\n';
    });

    return text;
  }
}

module.exports = {
  CodeBreakGame,
  COLORS,
  BOARD_SIZE,
  MAX_ATTEMPTS
};