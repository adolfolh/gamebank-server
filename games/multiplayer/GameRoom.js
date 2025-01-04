const { Room } = require("@colyseus/core");
const { BaseRoomState } = require("./RoomState");
const { gameConfig } = require("../../config/gameConfig");

class GameRoom extends Room {
  onCreate(options) {
    this.setState(new BaseRoomState());
    
    // Initialize room settings
    const config = gameConfig[options.gameType];
    if (!config) throw new Error("Invalid game type");

    this.maxClients = config.maxPlayers;
    this.gameType = options.gameType;
    this.state.gameType = options.gameType;
    this.autoDispose = false;

    // Heartbeat for disconnect detection (20fps)
    this.setSimulationInterval(() => this.onUpdate());

    // Message handlers
    this.onMessage("chat", (client, message) => {
      if (message.length > 500) return; // Prevent spam
      
      this.state.messages.set(Date.now().toString(), {
        playerId: client.sessionId,
        content: message,
        timestamp: Date.now()
      });
    });

    this.onMessage("ready", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.ready = true;
        this.checkGameStart();
      }
    });
  }

  onUpdate() {
    // Room-level updates (20fps)
    this.state.lastUpdated = Date.now();

    // Check for disconnected players
    this.state.players.forEach((player, sessionId) => {
      if (player.connected && Date.now() - player.lastPing > 5000) {
        player.connected = false;
        this.broadcast("player:disconnected", { playerId: sessionId });
      }
    });
  }

  async onJoin(client, options) {
    const config = gameConfig[this.gameType];
    
    // Validate room isn't full
    if (this.state.players.size >= config.maxPlayers) {
      throw new Error("Room is full");
    }

    // Validate game hasn't started
    if (this.state.status !== "lobby") {
      throw new Error("Game already in progress");
    }

    // Add player to room
    this.state.players.set(client.sessionId, {
      id: client.sessionId,
      name: options.playerName || "Player",
      isHost: this.state.players.size === 0,
      connected: true,
      joinedAt: Date.now(),
      ready: false,
      avatarIndex: Math.floor(Math.random() * 8) + 1,
      avatarHue: Math.floor(Math.random() * 360)
    });

    // Set host if first player
    if (this.state.players.size === 1) {
      this.state.hostId = client.sessionId;
    }

    // Broadcast join
    this.broadcast("player:joined", {
      playerId: client.sessionId,
      player: this.state.players.get(client.sessionId)
    });
  }

  async onLeave(client, consented) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (consented) {
      // Immediate leave
      this.removePlayer(client.sessionId);
    } else {
      // Temporary disconnect - wait for reconnection
      player.connected = false;
      
      try {
        await this.allowReconnection(client, 20);
        player.connected = true;
      } catch (e) {
        this.removePlayer(client.sessionId);
      }
    }
  }

  removePlayer(sessionId) {
    // Transfer host if needed
    if (sessionId === this.state.hostId) {
      const remainingPlayers = Array.from(this.state.players.keys())
        .filter(id => id !== sessionId);
      
      if (remainingPlayers.length > 0) {
        const newHostId = remainingPlayers[0];
        this.state.hostId = newHostId;
        this.state.players.get(newHostId).isHost = true;
      }
    }

    // Remove player
    this.state.players.delete(sessionId);

    // Clean up empty room
    if (this.state.players.size === 0) {
      this.disconnect();
    }
  }

  checkGameStart() {
    const config = gameConfig[this.gameType];
    const playerCount = this.state.players.size;

    // Check if we have enough players and all are ready
    if (playerCount >= config.minPlayers && 
        Array.from(this.state.players.values()).every(p => p.ready)) {
      this.startGame();
    }
  }

  startGame() {
    // Implemented by specific game rooms
    console.warn("startGame() not implemented");
  }

  onDispose() {
    console.log(`Room ${this.roomId} disposing...`);
  }
}

module.exports = {
  GameRoom
};