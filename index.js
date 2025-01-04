require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('@colyseus/core');
const { createServer } = require('http');
const { monitor } = require('@colyseus/monitor');
const { gameConfig } = require('./config/gameConfig');

// Import game rooms
const { HotTakesRoom } = require('./games/multiplayer/hot-takes/HotTakesRoom');
const { PixelPanicRoom } = require('./games/multiplayer/pixel-panic/PixelPanicRoom');

// Import single player handlers
const { generateDailyPuzzle, verifyDailyPuzzle } = require('./games/singleplayer/code-break/generator');

const port = parseInt(process.env.PORT, 10) || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create Colyseus server
const gameServer = new Server({
  server: createServer(app)
});

// Register multiplayer game rooms
gameServer.define('hot-takes', HotTakesRoom);
gameServer.define('pixel-panic', PixelPanicRoom);

// API Routes
app.get('/api/games', (req, res) => {
  res.json({ games: gameConfig });
});

// Single player game endpoints
app.get('/api/daily/code-break', (req, res) => {
  const puzzle = generateDailyPuzzle();
  res.json({ success: true, puzzle });
});

app.post('/api/verify/code-break', (req, res) => {
  const { seed, attempts } = req.body;
  const result = verifyDailyPuzzle(seed, attempts);
  
  if (!result) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid verification request' 
    });
  }
  
  res.json({ success: true, ...result });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Development tools
if (process.env.NODE_ENV !== 'production') {
  app.use('/colyseus', monitor());
}

// Start server
gameServer.listen(port);
console.log(`
🎮 GameBank Server Running

🌍 Server: http://localhost:${port}
🛠️  Monitor: http://localhost:${port}/colyseus
🎲 Environment: ${process.env.NODE_ENV || 'development'}
`);