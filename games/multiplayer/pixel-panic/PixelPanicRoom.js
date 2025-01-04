const { GameRoom } = require("../GameRoom");
const { PixelPanicState } = require("./PixelPanicState");
const { getRandomPrompt, isValidGuess, palette } = require("./prompts");
const { gameConfig } = require("../../../config/gameConfig");

class PixelPanicRoom extends GameRoom {
  onCreate(options) {
    super.onCreate({ ...options, gameType: "pixel-panic" });
    this.setState(new PixelPanicState());
    
    this.config = gameConfig["pixel-panic"];
    this.maxClients = this.config.maxPlayers;

    // Game-specific message handlers
    this.onMessage("draw:pixel", (client, data) => {
      this.handlePixelDraw(client, data);
    });

    this.onMessage("submit:guess", (client, guess) => {
      this.handleGuess(client, guess);
    });

    this.onMessage("clear:canvas", (client) => {
      this.handleClearCanvas(client);
    });
  }

  startGame() {
    this.state.status = "playing";
    this.playerOrder = Array.from(this.state.players.keys());
    this.startNewRound();
  }

  startNewRound() {
    this.state.currentRound++;
    
    // Select drawer (rotate through players)
    const drawerIndex = (this.state.currentRound - 1) % this.playerOrder.length;
    const drawerId = this.playerOrder[drawerIndex];
    
    // Get new prompt
    const { word: prompt } = getRandomPrompt(this.state.usedPrompts);
    this.state.usedPrompts.push(prompt);
    
    // Only send prompt to drawer
    this.clients.get(drawerId)?.send("prompt", prompt);

    // Reset round state
    this.state.currentRoundState = {
      roundNumber: this.state.currentRound,
      prompt: prompt,
      drawerId: drawerId,
      phase: "drawing",
      startedAt: Date.now(),
      endTime: Date.now() + (this.config.drawTime * 1000),
      guesses: new Map(),
      correctGuessers: [],
      pixels: new Map(),
      roundScores: new Map()
    };

    // Reset player states
    this.state.players.forEach(player => {
      player.hasGuessedCorrectly = false;
      player.guesses = [];
      player.pixels = new Map();
    });

    // Start round timer
    this.clock.setTimeout(() => {
      this.transitionToPhase("results");
    }, this.config.drawTime * 1000);

    // Broadcast round start
    this.broadcast("round:started", {
      roundNumber: this.state.currentRound,
      drawerId: drawerId,
      endTime: this.state.currentRoundState.endTime
    });
  }

  handlePixelDraw(client, { x, y, color }) {
    if (client.sessionId !== this.state.currentRoundState.drawerId) return;
    if (this.state.gamePhase !== "drawing") return;
    
    // Validate coordinates and color
    if (x < 0 || x >= this.state.canvasSize || 
        y < 0 || y >= this.state.canvasSize ||
        !palette.includes(color)) return;

    // Update pixel
    const key = `${x},${y}`;
    this.state.currentRoundState.pixels.set(key, color);
    
    // Broadcast pixel update
    this.broadcast("pixel:updated", { x, y, color });
  }

  handleGuess(client, guess) {
    if (client.sessionId === this.state.currentRoundState.drawerId) return;
    if (this.state.gamePhase !== "drawing") return;

    const player = this.state.players.get(client.sessionId);
    if (!player || player.hasGuessedCorrectly) return;

    // Record guess
    player.guesses.push(guess);
    this.state.currentRoundState.guesses.set(client.sessionId, guess);

    // Check if correct
    if (isValidGuess(guess, this.state.currentRoundState.prompt)) {
      player.hasGuessedCorrectly = true;
      this.state.currentRoundState.correctGuessers.push(client.sessionId);
      
      // Award points based on speed
      const timeElapsed = Date.now() - this.state.currentRoundState.startedAt;
      const maxPoints = 100;
      const points = Math.max(10, Math.floor(maxPoints * (1 - timeElapsed / (this.config.drawTime * 1000))));
      
      player.score += points;
      this.state.currentRoundState.roundScores.set(client.sessionId, points);

      // Broadcast correct guess
      this.broadcast("guess:correct", {
        playerId: client.sessionId,
        points: points
      });

      // If everyone guessed correctly, end round early
      const nonDrawingPlayers = this.state.players.size - 1;
      if (this.state.currentRoundState.correctGuessers.length === nonDrawingPlayers) {
        this.transitionToPhase("results");
      }
    }
  }

  handleClearCanvas(client) {
    if (client.sessionId !== this.state.currentRoundState.drawerId) return;
    if (this.state.gamePhase !== "drawing") return;

    // Clear all pixels
    this.state.currentRoundState.pixels.clear();
    this.broadcast("canvas:cleared");
  }

  transitionToPhase(phase) {
    clearTimeout(this.phaseTimeout);

    this.state.gamePhase = phase;
    this.state.phaseStartTime = Date.now();

    switch (phase) {
      case "results":
        // Award points to drawer based on correct guesses
        const drawer = this.state.players.get(this.state.currentRoundState.drawerId);
        const correctGuesses = this.state.currentRoundState.correctGuessers.length;
        const drawerPoints = Math.floor((correctGuesses / (this.state.players.size - 1)) * 50);
        drawer.score += drawerPoints;
        
        // Save round to history
        this.state.roundHistory.push({
          ...this.state.currentRoundState,
          drawerPoints
        });

        // Show results for 10 seconds
        this.state.phaseEndTime = Date.now() + 10000;
        this.phaseTimeout = this.clock.setTimeout(() => {
          if (this.state.currentRound >= this.config.rounds) {
            this.transitionToPhase("ended");
          } else {
            this.startNewRound();
          }
        }, 10000);
        break;

      case "ended":
        this.state.status = "finished";
        break;
    }
  }
}

module.exports = {
  PixelPanicRoom
};