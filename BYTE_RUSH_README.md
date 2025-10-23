# 🎮 BYTE RUSH - ByteClub Mini-Game

> **Endless runner inside a glowing cyber-terminal universe**

[![WebGL](https://img.shields.io/badge/WebGL-3D%20Graphics-green.svg)](https://threejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-blue.svg)](https://socket.io/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-orange.svg)](https://threejs.org/)

## ⚡ Overview

Byte Rush is a complete, highly-attractive ByteClub mini-game featuring:

- **WebGL/Three.js Frontend**: Immersive 3D graphics with neon effects
- **Real-time Leaderboard**: Live score updates via Socket.IO
- **Powerup System**: 5 unique powerups with visual effects
- **MERN Stack Integration**: Full backend API with MongoDB
- **Dark-Neon Aesthetic**: ByteClub cyber-terminal theme

## 🎯 Game Concept

**Title**: BYTE RUSH  
**Theme**: Endless runner inside a glowing cyber-terminal universe  
**Gameplay**: Fast-paced, visually dynamic, highly engaging WebGL 3D experience

### Core Mechanics
- **Player**: Glowing cube avatar with trail effects
- **Obstacles**: 3D bugs, exceptions, and memory leaks
- **Collectibles**: Neon commits (</> icons) floating in 3D space
- **Powerups**: Try-Catch Shield, Garbage Collector, Debugger Drone, Optimization Boost, Hotfix
- **Scoring**: Distance-based with commit collection bonuses

## 🖥️ Frontend Features

### WebGL Graphics Engine
- **Three.js Scene**: Player, obstacles, collectibles, background grid
- **Particle Systems**: Trail effects, neon particles, floating binary
- **Post-processing**: Bloom effects for glow and neon aesthetics
- **Dynamic Lighting**: Neon accent lights with fog effects
- **Smooth Animations**: Jumping, sliding, and double-jump with easing

### HUD & UI
- **Real-time Stats**: Score, distance, commits, active powerups
- **Live Leaderboard**: Top 50 entries with rank animations
- **Powerup Panel**: Visual timers and activation effects
- **Controls Display**: Keyboard shortcuts and game instructions
- **System Messages**: ByteClub console-style notifications

### Responsive Design
- **Desktop Optimized**: Full WebGL experience with keyboard controls
- **Mobile Ready**: Touch controls and responsive layout
- **Performance Scaling**: Automatic quality adjustment based on device

## 🔙 Backend Features

### API Endpoints
```typescript
POST /api/byte-rush/score          // Submit score
GET  /api/byte-rush/leaderboard    // Get leaderboard (top 50)
GET  /api/byte-rush/stats          // Get game statistics
GET  /api/byte-rush/config         // Get powerup definitions
GET  /api/byte-rush/me/best        // Get user's best score
GET  /api/byte-rush/me/recent      // Get user's recent scores
```

### Real-time Features
- **Socket.IO Integration**: Live leaderboard updates
- **Multiplayer Awareness**: Player position broadcasting
- **Powerup Broadcasting**: Real-time powerup activation events
- **Connection Management**: Automatic reconnection and error handling

### Anti-Cheat System
- **Score Validation**: Reasonable limits and ratio checks
- **Rate Limiting**: 5 submissions per minute per IP
- **Duration Validation**: Minimum/maximum run time checks
- **Distance Validation**: Realistic speed and distance ratios

## 🎨 Visual Design

### Color Palette
- **Background**: `#0a0e14` (Dark cyber-terminal)
- **Neon Cyan**: `#00fff9` (Primary accent)
- **Magenta**: `#ff3bcf` (Secondary accent)
- **Electric Purple**: `#a020f0` (Powerup accent)
- **Lime Accent**: `#7fff00` (Success/collectibles)

### Typography
- **Font**: JetBrains Mono, Fira Code (Monospace)
- **Style**: Console/terminal aesthetic
- **Animations**: Glow effects and pulsing text

### Effects
- **Bloom/Glow**: All moving elements have neon glow
- **Trail Particles**: Player movement trails
- **Neon Particles**: Collectible pickup effects
- **Glitch Effects**: Obstacle collision animations
- **Smooth Transitions**: Framer Motion for UI animations

## 🎮 Powerups & Abilities

### 1. Try-Catch Shield
- **Color**: Neon Cyan (`#00fff9`)
- **Effect**: Protects from one collision
- **Duration**: 5 seconds
- **Visual**: Shield bubble particle effect

### 2. Garbage Collector
- **Color**: Lime (`#7fff00`)
- **Effect**: Clears obstacles ahead
- **Duration**: 3 seconds
- **Visual**: Wave effect clearing obstacles

### 3. Debugger Drone
- **Color**: Magenta (`#ff3bcf`)
- **Effect**: Collects nearby commits automatically
- **Duration**: 8 seconds
- **Visual**: Small floating drone following player

### 4. Optimization Boost
- **Color**: Electric Purple (`#a020f0`)
- **Effect**: Slows time and increases score multiplier
- **Duration**: 4 seconds
- **Visual**: Blue tint and motion blur

### 5. Hotfix
- **Color**: Orange (`#ff6b35`)
- **Effect**: Respawn with invincibility
- **Duration**: 2 seconds
- **Visual**: Neon explosion and trail particles

## 🏆 Leaderboard System

### Scoring
- **Base Score**: 10 points per distance unit
- **Commit Bonus**: 100 points per commit collected
- **Powerup Bonus**: 50 points per powerup used
- **Collision Penalty**: -1000 points

### Ranking
- **Primary**: Score (descending)
- **Secondary**: Run duration (ascending - faster is better)
- **Tertiary**: Creation date (descending - newer is better)

### Real-time Updates
- **Live Leaderboard**: Updates every 30 seconds
- **Socket Events**: Instant updates on new scores
- **Rank Animations**: Smooth transitions for rank changes
- **Personal Best**: Highlight user's best score

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Modern browser with WebGL support

### Installation
```bash
# Clone repository
git clone <repository-url>
cd byte-club

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development
```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### Production Deployment
See [BYTE_RUSH_DEPLOYMENT.md](./BYTE_RUSH_DEPLOYMENT.md) for detailed deployment instructions.

## 🎯 Game Controls

### Keyboard Controls
- **Space**: Jump
- **Arrow Down**: Slide
- **P**: Pause/Resume
- **Escape**: Exit game

### Touch Controls (Mobile)
- **Tap**: Jump
- **Swipe Down**: Slide
- **Long Press**: Pause

## 📊 Game Statistics

### Tracked Metrics
- **Total Scores**: All-time score submissions
- **Total Players**: Unique players (registered + anonymous)
- **Average Score**: Mean score across all runs
- **Average Distance**: Mean distance achieved
- **Powerup Usage**: Most/least used powerups
- **Session Duration**: Average play time

### Real-time Stats
- **Players Online**: Currently connected users
- **Recent Activity**: Last 10 score submissions
- **Leaderboard Updates**: Live rank changes

## 🔧 Technical Architecture

### Frontend Stack
- **React 18**: Component-based UI
- **Three.js**: WebGL 3D graphics engine
- **Framer Motion**: Smooth animations
- **Socket.IO Client**: Real-time communication
- **TailwindCSS**: Utility-first styling
- **TypeScript**: Type-safe development

### Backend Stack
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Rate Limiting**: Anti-cheat protection

### Database Schema
```typescript
interface ByteRushScore {
  userId?: string;           // Optional user ID
  displayName: string;       // Player display name
  score: number;            // Final score
  distance: number;         // Distance traveled
  commits: number;          // Commits collected
  runDurationMs: number;    // Run duration in milliseconds
  powerupsUsed: string[];   // Powerups activated
  clientGameVersion: string; // Game version
  createdAt: Date;          // Submission timestamp
}
```

## 🎨 ByteClub Integration

### Theme Consistency
- **Console Aesthetics**: Terminal-style UI elements
- **Neon Glow Effects**: Consistent with ByteClub branding
- **Monospace Typography**: Code-like appearance
- **Dark Color Scheme**: Professional developer theme

### System Messages
```
[BYTECLUB] Game engine initialized
[SYS] WebGL renderer active
[DEBUG] Physics engine running
[GAME] Runner active
[BYTECLUB] Game session complete. Great run! 🚀
```

### Code Comments
All code includes ByteClub flavor comments:
```typescript
// BYTECLUB: Player collision handled here. Neon explosion on crash. 💥
// BYTECLUB: Powerup activation with particle effects
// BYTECLUB: Real-time leaderboard update via Socket.IO
```

## 🚨 Troubleshooting

### Common Issues

#### Game Not Loading
- Check browser WebGL support
- Verify Three.js dependencies
- Check console for errors

#### Socket Connection Failed
- Verify backend URL configuration
- Check CORS settings
- Ensure Socket.IO server is running

#### Score Submission Failed
- Check rate limiting (5 submissions/minute)
- Verify score validation rules
- Check network connectivity

### Performance Issues
- Reduce particle count on low-end devices
- Disable post-processing effects
- Lower WebGL quality settings

## 🎯 Future Roadmap

### Planned Features
- **Multiplayer Racing**: Real-time competitive races
- **Custom Skins**: Unlockable themes and avatars
- **Achievement System**: Badges and milestones
- **Tournament Mode**: Scheduled competitions
- **Mobile App**: Native iOS/Android versions

### Technical Improvements
- **WebGL 2.0**: Enhanced graphics capabilities
- **WebAssembly**: Physics engine optimization
- **Progressive Web App**: Offline play support
- **Analytics Dashboard**: Real-time metrics

## 📈 Performance Metrics

### Target Performance
- **60 FPS**: Smooth gameplay on modern devices
- **<100ms**: Socket.IO message latency
- **<2s**: Game loading time
- **<500ms**: Score submission response

### Optimization Strategies
- **Object Pooling**: Reuse 3D objects
- **LOD System**: Level-of-detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Texture Atlasing**: Reduce draw calls

## 🤝 Contributing

### Development Guidelines
1. Follow ByteClub code style and comments
2. Include comprehensive error handling
3. Add TypeScript types for all interfaces
4. Test on multiple devices and browsers
5. Document new features and APIs

### Code Style
```typescript
// BYTECLUB: Feature description with emoji
const featureName = () => {
  // Implementation with ByteClub flavor
  console.log('[BYTECLUB] Feature activated! 🚀');
};
```

## 📄 License

This project is part of the ByteClub ecosystem. See main project license for details.

## 🎮 Play Now!

Ready to experience the ultimate cyber-terminal endless runner?

**Start your Byte Rush adventure at ByteClub! 🚀**

---

*Byte Rush - Where every byte counts in the race to the top! ⚡*
