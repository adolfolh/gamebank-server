const { GameRoom } = require("../GameRoom");
const { HotTakesState } = require("./HotTakesState");
const { getRandomQuestion } = require("./questions");
const { gameConfig } = require("../../../config/gameConfig");

class HotTakesRoom extends GameRoom {
  onCreate(options) {
    super.onCreate({ ...options, gameType: "hot-takes" });
    this.setState(new HotTakesState());
    
    this.config = gameConfig["hot-takes"];
    this.maxClients = this.config.maxPlayers;

    // Game-specific message handlers
    this.onMessage("submit:answer", (client, answer) => {
      this.handleAnswer(client, answer);
    });

    this.onMessage("submit:predictions", (client, predictions) => {
      this.handlePredictions(client, predictions);
    });
  }

  startGame() {
    this.state.status = "playing";
    this.state.gamePhase = "answering";
    this.startNewRound();
  }

  startNewRound() {
    this.state.currentRound++;
    
    // Get new question
    const nextQuestion = getRandomQuestion(this.state.usedQuestions);
    this.state.usedQuestions.push(nextQuestion);
    this.state.currentQuestion = nextQuestion;

    // Reset round state
    this.state.currentRoundState = {
      roundNumber: this.state.currentRound,
      question: nextQuestion,
      phase: "answering",
      startedAt: Date.now(),
      endTime: Date.now() + (this.config.roundTime * 1000),
      answers: new Map(),
      predictions: new Map(),
      roundScores: new Map()
    };

    // Clear previous answers/predictions
    this.state.players.forEach(player => {
      player.answer = null;
      player.predictions = [];
    });

    // Start answer phase timer
    this.clock.setTimeout(() => {
      this.transitionToPhase("predicting");
    }, this.config.roundTime * 1000);
  }

  handleAnswer(client, answer) {
    if (!["agree", "disagree"].includes(answer)) return;
    if (this.state.gamePhase !== "answering") return;

    const player = this.state.players.get(client.sessionId);
    if (!player || player.answer) return;

    // Record answer
    player.answer = answer;
    this.state.currentRoundState.answers.set(client.sessionId, answer);

    // Check if all players answered
    if (this.state.currentRoundState.answers.size === this.state.players.size) {
      this.transitionToPhase("predicting");
    }
  }

  handlePredictions(client, predictions) {
    if (this.state.gamePhase !== "predicting") return;
    if (!Array.isArray(predictions)) return;

    const player = this.state.players.get(client.sessionId);
    if (!player || player.predictions.length > 0) return;

    // Validate predictions
    const validPredictions = predictions.filter(id => 
      this.state.players.has(id) && id !== client.sessionId
    );

    // Record predictions
    player.predictions = validPredictions;
    this.state.currentRoundState.predictions.set(client.sessionId, validPredictions);

    // Check if all players predicted
    if (this.state.currentRoundState.predictions.size === this.state.players.size) {
      this.transitionToPhase("results");
    }
  }

  transitionToPhase(phase) {
    clearTimeout(this.phaseTimeout);

    this.state.gamePhase = phase;
    this.state.phaseStartTime = Date.now();

    switch (phase) {
      case "predicting":
        this.state.phaseEndTime = Date.now() + (this.config.predictTime * 1000);
        this.phaseTimeout = this.clock.setTimeout(() => {
          this.transitionToPhase("results");
        }, this.config.predictTime * 1000);
        break;

      case "results":
        this.calculateScores();
        this.state.phaseEndTime = Date.now() + (this.config.resultTime * 1000);
        this.phaseTimeout = this.clock.setTimeout(() => {
          if (this.state.currentRound >= this.config.rounds) {
            this.transitionToPhase("ended");
          } else {
            this.startNewRound();
          }
        }, this.config.resultTime * 1000);
        break;

      case "ended":
        this.state.status = "finished";
        break;
    }
  }

  calculateScores() {
    const roundScores = new Map();
    
    // Calculate points for correct predictions
    this.state.currentRoundState.predictions.forEach((predictions, predictorId) => {
      const predictorAnswer = this.state.currentRoundState.answers.get(predictorId);
      let points = 0;

      predictions.forEach(targetId => {
        const targetAnswer = this.state.currentRoundState.answers.get(targetId);
        if (targetAnswer === predictorAnswer) {
          points += 1;
        }
      });

      roundScores.set(predictorId, points);
      
      // Update total score
      const player = this.state.players.get(predictorId);
      player.score += points;
    });

    this.state.currentRoundState.roundScores = roundScores;
  }
}

module.exports = {
  HotTakesRoom
};