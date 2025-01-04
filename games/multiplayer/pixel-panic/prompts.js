const prompts = [
    // Simple Objects
    { word: "pizza", category: "food" },
    { word: "rocket", category: "space" },
    { word: "cactus", category: "nature" },
    { word: "ghost", category: "spooky" },
    { word: "robot", category: "technology" },
    
    // Animals
    { word: "cat", category: "animals" },
    { word: "duck", category: "animals" },
    { word: "penguin", category: "animals" },
    
    // Environment
    { word: "cloud", category: "weather" },
    { word: "rainbow", category: "weather" },
    { word: "castle", category: "buildings" },
    
    // Video Game Themed
    { word: "mario", category: "games" },
    { word: "pacman", category: "games" },
    { word: "tetris", category: "games" },
    { word: "portal", category: "games" },
    
    // Emojis
    { word: "smile", category: "emoji" },
    { word: "heart", category: "emoji" },
    { word: "star", category: "emoji" },
    
    // Internet Culture
    { word: "meme", category: "internet" },
    { word: "troll", category: "internet" },
    { word: "gif", category: "internet" }
  ];
  
  // Colors for the pixel art palette
  const palette = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFC0CB", // Pink
    "#A52A2A"  // Brown
  ];
  
  function getRandomPrompt(usedPrompts = []) {
    const availablePrompts = prompts.filter(p => !usedPrompts.includes(p.word));
    if (availablePrompts.length === 0) return prompts[0];
    
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    return availablePrompts[randomIndex];
  }
  
  function isValidGuess(guess, prompt) {
    // Basic string similarity check
    const normalize = str => str.toLowerCase().trim();
    const normalizedGuess = normalize(guess);
    const normalizedPrompt = normalize(prompt);
  
    // Exact match
    if (normalizedGuess === normalizedPrompt) return true;
  
    // Close enough (you might want to use a more sophisticated algorithm)
    const levenshteinDistance = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
  
      const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
  
      return matrix[a.length][b.length];
    };
  
    // Allow for small typos (distance of 2 or less)
    return levenshteinDistance(normalizedGuess, normalizedPrompt) <= 2;
  }
  
  module.exports = {
    prompts,
    palette,
    getRandomPrompt,
    isValidGuess
  };