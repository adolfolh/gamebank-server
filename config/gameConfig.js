const gameConfig = {
    multiplayer: {
      "hot-takes": {
        id: "hot-takes",
        name: "Hot Takes",
        description: "Vote on spicy takes and predict how others will respond!",
        icon: "🔥",
        type: "multiplayer",
        thumbnail: "/games/hot-takes/thumbnail.png",
        background: "/games/hot-takes/background.png",
        config: {
          minPlayers: 3,
          maxPlayers: 8,
          roundTime: 30,
          predictTime: 30,
          resultTime: 15,
          rounds: 5
        },
        features: [
          "No drawing required",
          "Perfect party game",
          "Quick rounds"
        ]
      },
      "pixel-panic": {
        id: "pixel-panic",
        name: "Pixel Panic",
        description: "Draw and guess pixel art creations in real-time!",
        icon: "🎨",
        type: "multiplayer",
        thumbnail: "/games/pixel-panic/thumbnail.png",
        background: "/games/pixel-panic/background.png",
        config: {
          minPlayers: 4,
          maxPlayers: 10,
          drawTime: 60,
          canvasSize: 32,
          rounds: 3,
          palette: [
            "#000000", "#FFFFFF", "#FF0000", "#00FF00",
            "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"
          ]
        },
        features: [
          "Real-time pixel art",
          "Quick sketches",
          "Fun for artists and non-artists"
        ]
      }
    },
    singleplayer: {
      "code-break": {
        id: "code-break",
        name: "Code Break",
        description: "Daily color pattern puzzle - can you crack the code?",
        icon: "🔐",
        type: "singleplayer",
        thumbnail: "/games/code-break/thumbnail.png",
        background: "/games/code-break/background.png",
        config: {
          boardSize: 6,
          maxAttempts: 8,
          colors: ["red", "blue", "green", "yellow", "purple", "orange"],
          resetTime: "00:00" // UTC
        },
        features: [
          "New puzzle daily",
          "Share results",
          "Color-based gameplay"
        ]
      }
    }
  };
  
  module.exports = {
    gameConfig,
    getGameConfig: (type, id) => gameConfig[type]?.[id]
  };