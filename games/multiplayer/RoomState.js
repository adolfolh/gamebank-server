const { Schema, MapSchema, type } = require("@colyseus/schema");

class Player extends Schema {
  constructor() {
    super();
    this.connected = true;
    this.joinedAt = Date.now();
  }

  @type("string") id;
  @type("string") name;
  @type("boolean") isHost;
  @type("boolean") connected;
  @type("number") joinedAt;
  @type("number") avatarIndex;
  @type("number") avatarHue;
}

class BaseRoomState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.createdAt = Date.now();
    this.status = "lobby"; // lobby, playing, finished
    this.messages = new MapSchema(); // For in-game chat
  }

  @type("string") roomId;
  @type("string") hostId;
  @type({ map: Player }) players;
  @type("number") createdAt;
  @type("string") gameType;
  @type("string") status;
  @type({ map: "string" }) messages;
  @type("number") lastUpdated;
}

module.exports = {
  Player,
  BaseRoomState
};