# Byte Club Backend API

A production-ready Node.js + TypeScript + Express backend for the Byte Club learning platform.

## Features

- **Authentication**: JWT-based auth with refresh tokens
- **Challenges**: MCQ, True/False, and Code challenges
- **XP System**: Dynamic leveling based on XP earned
- **Streaks**: Daily challenge completion tracking
- **Badges**: Automatic badge unlocking system
- **Rewards**: XP-based reward purchasing system
- **Leaderboards**: All-time and weekly rankings
- **Daily Challenges**: Random daily challenge selection
- **MongoDB Atlas**: Cloud-hosted database with optimized collections

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, input validation with Zod
- **Logging**: Structured logging with Pino
- **Code Execution**: Secure sandboxed execution with vm2

## Database Collections

The backend uses 6 optimized collections for MongoDB Atlas free tier:

1. **users** - User profiles, XP, streaks, badges, rewards
2. **challenges** - Challenge definitions and content
3. **attempts** - User challenge attempts (with TTL)
4. **meta** - Badges, rewards, and quest definitions
5. **sessions** - Refresh tokens (with TTL)
6. **migrations** - Migration and seed tracking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/:id/earned` - Get user badges/rewards

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:slug` - Get specific challenge
- `POST /api/challenges/:slug/submit` - Submit challenge answer

### Meta
- `GET /api/meta/:type` - Get badges/rewards/quests
- `POST /api/meta/seed` - Seed meta data (admin only)

### Rewards
- `POST /api/rewards/purchase/:key` - Purchase reward with XP

### Daily
- `GET /api/daily` - Get today's daily challenge

## XP and Level System

- **Easy challenges**: 50 XP
- **Medium challenges**: 100 XP
- **Hard challenges**: 200 XP
- **Level formula**: `floor(XP / 500) + 1`
- **Streak bonus**: +20 XP after 5 consecutive days

## Badge System

Badges are automatically unlocked based on achievements:

- **first_solve**: Complete first challenge
- **five_solve**: Complete 5 challenges
- **ten_solve**: Complete 10 challenges
- **streak_5**: 5-day streak
- **streak_10**: 10-day streak
- **xp_1000**: Earn 1000 XP
- **xp_5000**: Earn 5000 XP
- **easy_master**: Complete all easy challenges
- **medium_master**: Complete all medium challenges
- **hard_master**: Complete all hard challenges

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   Copy `env.example` to `.env` and configure:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   JWT_SECRET=your-secret-key
   PORT=3001
   ```

3. **Run database seeds**:
   ```bash
   npm run seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Run database seeding
- `npm run migrate` - Run database migrations

## Security Features

- **Password hashing**: bcrypt with 12 salt rounds
- **JWT tokens**: Secure access and refresh tokens
- **Input validation**: Zod schema validation
- **Security headers**: Helmet middleware
- **CORS protection**: Configurable origins
- **Code execution**: Sandboxed with vm2
- **Rate limiting**: Built-in Express rate limiting

## Database Optimization

- **Indexes**: Optimized for common queries
- **TTL indexes**: Automatic cleanup of old data
- **Projections**: Minimal data transfer
- **Aggregation**: Efficient leaderboard queries
- **Connection pooling**: Optimized MongoDB connections

## Logging

Structured logging with Pino:
- Request/response logging
- Error tracking
- Performance metrics
- Database operation logs

## Error Handling

- Global error handler
- Validation error responses
- Database error handling
- JWT error handling
- Graceful shutdown

## Production Deployment

1. Set environment variables
2. Run database migrations
3. Build the application
4. Start with PM2 or similar process manager
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging

## API Response Format

All endpoints return consistent JSON responses:

```json
{
  "success": boolean,
  "message": string,
  "data": object | null
}
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include request validation
4. Write comprehensive tests
5. Update documentation

## License

MIT License - see LICENSE file for details.
