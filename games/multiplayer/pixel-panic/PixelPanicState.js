const { Schema, MapSchema, ArraySchema, type } = require("@colyseus/schema");
const { BaseRoomState, Player } = require("../RoomState");

class PixelPanicPlayer extends Player {
  constructor() {
    super();
    this.score = 0;
    this.guesses = new ArraySchema();
    this.pixels = new MapSchema(); // For current drawing
  }

  @type("number") score;
  @type(["string"]) guesses;
  @type({ map: "string" }) pixels; // x,y -> color
  @type("boolean") hasGuessedCorrectly = false;
  @type("boolean") ready = false;
}

class Round extends Schema {
  constructor() {
    super();
    this.guesses = new MapSchema();
    this.correctGuessers = new ArraySchema();
  }

  @type("number") roundNumber;
  @type("string") prompt;
  @type("string") drawerId; // Player ID who is drawing
  @type("string") phase; // preparing, drawing, results
  @type("number") startedAt;
  @type("number") endTime;
  @type({ map: "string" }) guesses; // playerId -> guess
  @type(["string"]) correctGuessers; // playerIds who guessed correctly
  @type({ map: "string" }) pixels; // Final drawing state
  @type({ map: "number" }) roundScores;
}

class PixelPanicState extends BaseRoomState {
  constructor() {
    super();
    this.players = new MapSchema();
    this.roundHistory = new ArraySchema();
    this.usedPrompts = new ArraySchema();
  }

  @type("number") currentRound = 0;
  @type("number") maxRounds = 3;
  @type("string") currentPrompt;
  @type({ map: PixelPanicPlayer }) players;
  @type(Round) currentRoundState;
  @type(["string"]) usedPrompts;
  @type("string") gamePhase = "lobby";
  @type("number") phaseStartTime;
  @type("number") phaseEndTime;
  @type("number") canvasSize = 32; // 32x32 pixel grid
}

module.exports = {
  PixelPanicPlayer,
  Round,
  PixelPanicState
};