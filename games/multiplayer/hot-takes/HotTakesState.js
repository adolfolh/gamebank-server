const { Schema, MapSchema, ArraySchema, type } = require("@colyseus/schema");
const { BaseRoomState, Player } = require("../RoomState");

class HotTakesPlayer extends Player {
  constructor() {
    super();
    this.score = 0;
    this.predictions = new ArraySchema();
  }

  @type("number") score;
  @type("string") answer;
  @type(["string"]) predictions;
  @type("boolean") ready = false;
}

class Round extends Schema {
  constructor() {
    super();
    this.answers = new MapSchema();
    this.predictions = new MapSchema();
  }

  @type("number") roundNumber;
  @type("string") question;
  @type("string") phase; // answering, predicting, results
  @type("number") startedAt;
  @type("number") endTime;
  @type({ map: "string" }) answers;
  @type({ map: ["string"] }) predictions;
  @type({ map: "number" }) roundScores;
}

class HotTakesState extends BaseRoomState {
  constructor() {
    super();
    this.players = new MapSchema();
    this.roundHistory = new ArraySchema();
    this.usedQuestions = new ArraySchema();
  }

  @type("number") currentRound = 0;
  @type("number") maxRounds = 5;
  @type("string") currentQuestion;
  @type({ map: HotTakesPlayer }) players;
  @type(Round) currentRoundState;
  @type(["string"]) usedQuestions;
  @type("string") gamePhase = "lobby"; // lobby, answering, predicting, results, ended
  @type("number") phaseStartTime;
  @type("number") phaseEndTime;
}

module.exports = {
  HotTakesPlayer,
  Round,
  HotTakesState
};