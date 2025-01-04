# GameBank Server

Backend server for GameBank - a platform hosting both multiplayer party games and daily single-player challenges. No account required!

## Current Games

### Multiplayer 🎮
- **Hot Takes**: Social game of opinions & predictions (3-8 players)
- **Pixel Panic**: Real-time pixel art & guessing game (4-10 players)

### Single Player 🎲
- **Code Break**: Daily color pattern puzzle (like Wordle but with colors & patterns)

## Tech Stack
- Server: Node.js + Express
- Real-time: Colyseus
- Client: React + Next.js (separate repository)

## Key Features
- No authentication required
- Instant play with room codes
- Daily single-player challenges
- Shareable results

## Development

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Production
npm start