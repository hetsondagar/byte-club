# BYTECLUB: Byte Rush Deployment Guide

## 🎮 Overview

Byte Rush is a complete WebGL-powered endless runner game integrated with the ByteClub MERN stack. This guide covers deployment for both frontend and backend components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier)
- Vercel account (for frontend)
- Render/Railway account (for backend)

### Environment Variables

#### Backend (.env)
```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/byte_club

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Socket.IO
SOCKET_IO_SECRET=your-socket-io-secret-here

# CORS (for production)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### Frontend (.env.production)
```bash
# Backend API
VITE_BACKEND_URL=https://your-backend-domain.onrender.com

# Socket.IO
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

## 🖥️ Frontend Deployment (Vercel)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Environment Variables in Vercel
Set these in Vercel dashboard:
- `VITE_BACKEND_URL`: Your backend URL
- `VITE_SOCKET_URL`: Your backend URL (same as above)

## 🔙 Backend Deployment (Render)

### 1. Prepare Backend
```bash
cd backend
npm install
npm run build
```

### 2. Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users

### 3. Environment Variables in Render
Set these in Render dashboard:
- `MONGO_URI`: Your MongoDB Atlas connection string
- `PORT`: 4000
- `NODE_ENV`: production
- `JWT_SECRET`: Generate a secure random string
- `SOCKET_IO_SECRET`: Generate a secure random string
- `FRONTEND_URL`: Your Vercel frontend URL

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create Database
```bash
# Connect to your MongoDB Atlas cluster
# Database name: byte_club
# Collections will be created automatically
```

### 2. Seed Demo Data
```bash
cd backend
npm run seed
```

This will create:
- Demo leaderboard entries
- Powerup definitions
- Game configuration

### 3. Indexes (Optional)
MongoDB will create indexes automatically, but you can verify:
```javascript
// In MongoDB Atlas console
db.byteRushScores.createIndex({ score: -1, runDurationMs: 1, createdAt: -1 })
db.byteRushScores.createIndex({ userId: 1, createdAt: -1 })
```

## 🎮 Game Features

### Core Gameplay
- **Endless Runner**: WebGL-powered 3D graphics with Three.js
- **Player Controls**: Space to jump, Arrow Down to slide, P to pause
- **Obstacles**: Bugs, exceptions, memory leaks with collision detection
- **Collectibles**: Neon commits floating in 3D space
- **Powerups**: 5 different powerups with visual effects

### Powerups
1. **Try-Catch Shield** (Cyan) - Protects from one collision
2. **Garbage Collector** (Lime) - Clears obstacles ahead
3. **Debugger Drone** (Pink) - Collects nearby commits automatically
4. **Optimization Boost** (Purple) - Slows time and increases score multiplier
5. **Hotfix** (Orange) - Respawn with invincibility

### Real-time Features
- **Live Leaderboard**: Top 50 scores updated in real-time
- **Socket.IO Integration**: Real-time score submissions and updates
- **Multiplayer Awareness**: See other players' positions and powerup activations
- **Game Statistics**: Live stats on total players, scores, and averages

## 🔧 Development Setup

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 API Endpoints

### Byte Rush API
- `POST /api/byte-rush/score` - Submit score
- `GET /api/byte-rush/leaderboard` - Get leaderboard
- `GET /api/byte-rush/stats` - Get game statistics
- `GET /api/byte-rush/config` - Get powerup definitions
- `GET /api/byte-rush/me/best` - Get user's best score (auth required)
- `GET /api/byte-rush/me/recent` - Get user's recent scores (auth required)

### Socket.IO Events
- `joinGame` - Join game room
- `leaveGame` - Leave game room
- `submitScore` - Submit score via socket
- `leaderboardUpdate` - Receive leaderboard updates
- `powerupActivated` - Broadcast powerup activation
- `playerPosition` - Update player position

## 🎨 Visual Features

### WebGL Graphics
- **3D Player**: Glowing cube with trail effects
- **Neon Obstacles**: Rotating and pulsing with glow
- **Particle Systems**: Background particles and powerup effects
- **Bloom Effects**: Post-processing for neon glow
- **Dynamic Lighting**: Neon accent lights and fog

### UI/UX
- **Dark-Neon Theme**: ByteClub aesthetic with cyan, purple, pink colors
- **Animated HUD**: Real-time score, distance, and powerup display
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Framer Motion for UI transitions

## 🚨 Troubleshooting

### Common Issues

#### Frontend
- **WebGL not supported**: Check browser compatibility
- **Socket connection failed**: Verify backend URL and CORS settings
- **Game not loading**: Check console for Three.js errors

#### Backend
- **MongoDB connection failed**: Verify MONGO_URI and network access
- **Socket.IO errors**: Check CORS configuration
- **Score submission failed**: Verify rate limiting and validation

#### Deployment
- **Build failures**: Check Node.js version compatibility
- **Environment variables**: Ensure all required vars are set
- **CORS errors**: Verify frontend URL in backend CORS config

### Performance Optimization
- **WebGL Performance**: Reduce particle count on low-end devices
- **Socket.IO**: Implement connection pooling for high traffic
- **Database**: Add indexes for leaderboard queries
- **CDN**: Use Vercel's CDN for static assets

## 📈 Monitoring

### Analytics
- Track player engagement and session duration
- Monitor leaderboard activity and score distributions
- Analyze powerup usage patterns
- Track connection stability and error rates

### Logging
- Backend logs all score submissions and errors
- Frontend logs game events and performance metrics
- Socket.IO connection status and message counts

## 🔒 Security

### Anti-Cheat Measures
- Score validation with reasonable limits
- Rate limiting on score submissions
- Distance/score ratio validation
- Duration validation for runs

### Data Protection
- JWT authentication for user-specific features
- Input sanitization and validation
- CORS configuration for production
- Rate limiting to prevent abuse

## 🎯 Future Enhancements

### Planned Features
- **Multiplayer Racing**: Real-time competitive races
- **Custom Skins**: Unlockable player and obstacle themes
- **Achievement System**: Badges for milestones and challenges
- **Tournament Mode**: Scheduled competitions with prizes
- **Mobile Optimization**: Touch controls and responsive design

### Technical Improvements
- **WebGL 2.0**: Enhanced graphics and performance
- **WebAssembly**: Physics engine optimization
- **Progressive Web App**: Offline play capabilities
- **Analytics Dashboard**: Real-time game metrics

## 📞 Support

For issues or questions:
1. Check this deployment guide
2. Review console logs for errors
3. Verify environment variables
4. Test API endpoints manually
5. Check MongoDB Atlas connection

---

**BYTECLUB: Where every byte counts! 🚀**

*Byte Rush - The ultimate cyber-terminal endless runner experience*
