const { CodeBreakGame } = require('./CodeBreakGame');

function getDailyPuzzleSeed() {
  const date = new Date();
  return `codebreak-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function generateDailyPuzzle() {
  const seed = getDailyPuzzleSeed();
  const game = new CodeBreakGame(seed);
  
  return {
    id: seed,
    boardSize: game.BOARD_SIZE,
    maxAttempts: game.MAX_ATTEMPTS,
    colors: game.COLORS,
    // Don't return solution - it stays server-side!
  };
}

function verifyDailyPuzzle(seed, attempts) {
  const game = new CodeBreakGame(seed);
  
  // Validate attempts
  if (!Array.isArray(attempts) || 
      attempts.length > game.MAX_ATTEMPTS ||
      !attempts.every(attempt => game.isValidGuess(attempt))) {
    return null;
  }

  // Check each attempt
  const results = attempts.map(attempt => ({
    guess: attempt,
    result: game.checkGuess(attempt)
  }));

  // Generate share text
  const shareText = game.generateShareText(attempts);

  return {
    results,
    shareText,
    solved: results.some(r => r.result.exact === game.BOARD_SIZE)
  };
}

module.exports = {
  generateDailyPuzzle,
  verifyDailyPuzzle
};