# Byte Club API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null
}
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "username": "string (3-30 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "totalXP": 0,
      "currentLevel": 1,
      "currentStreak": 0,
      "badges": [],
      "rewards": [],
      "role": "user"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

#### POST /api/auth/logout
Logout user (invalidate tokens).

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "user": { /* user object */ }
  }
}
```

### Users

#### GET /api/users/:id
Get user profile by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": { /* user object */ }
  }
}
```

#### PATCH /api/users/:id
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

#### GET /api/users/leaderboard
Get leaderboard data.

**Query Parameters:**
- `type` (optional): "all-time" or "weekly" (default: "all-time")

**Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "_id": "string",
        "username": "string",
        "totalXP": 1500,
        "currentLevel": 4,
        "rank": 1
      }
    ],
    "type": "all-time"
  }
}
```

#### GET /api/users/:id/earned
Get user's badges and rewards.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User earned data retrieved successfully",
  "data": {
    "badges": ["first_solve", "five_solve"],
    "rewards": ["neon_profile_frame"],
    "completedChallenges": ["first-challenge", "variables-basics"]
  }
}
```

### Challenges

#### GET /api/challenges
Get all challenges with optional filtering.

**Query Parameters:**
- `difficulty` (optional): "easy", "medium", "hard"
- `type` (optional): "mcq", "true/false", "code"
- `tags` (optional): comma-separated tags
- `isDaily` (optional): "true" or "false"

**Response:**
```json
{
  "success": true,
  "message": "Challenges retrieved successfully",
  "data": {
    "challenges": [
      {
        "_id": "string",
        "slug": "first-challenge",
        "title": "Hello World",
        "description": "Your first step into the Byte Club universe",
        "difficulty": "easy",
        "type": "mcq",
        "xpReward": 50,
        "content": {
          "question": "What is the traditional first program...",
          "options": ["Hello World", "Goodbye World", ...]
        },
        "tags": ["beginner", "programming"],
        "isDaily": true,
        "isActive": true
      }
    ]
  }
}
```

#### GET /api/challenges/:slug
Get specific challenge by slug.

**Response:**
```json
{
  "success": true,
  "message": "Challenge retrieved successfully",
  "data": {
    "challenge": { /* challenge object without correct answer */ }
  }
}
```

#### POST /api/challenges/:slug/submit
Submit challenge answer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "answer": "string | number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Challenge completed successfully!",
  "data": {
    "isCorrect": true,
    "xpEarned": 50,
    "streak": 1,
    "totalXP": 50
  }
}
```

### Meta

#### GET /api/meta/:type
Get meta data (badges, rewards, or quests).

**Parameters:**
- `type`: "badge", "reward", or "quest"

**Response:**
```json
{
  "success": true,
  "message": "Meta data retrieved successfully",
  "data": {
    "items": [
      {
        "_id": "string",
        "key": "first_solve",
        "type": "badge",
        "name": "First Challenge",
        "description": "Completed your first challenge",
        "xpReward": 0,
        "icon": "🎯"
      }
    ]
  }
}
```

#### POST /api/meta/seed
Seed meta data (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "message": "Meta seeding endpoint - use seed script instead"
}
```

### Rewards

#### POST /api/rewards/purchase/:key
Purchase reward with XP.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `key`: reward key (e.g., "neon_profile_frame")

**Response:**
```json
{
  "success": true,
  "message": "Reward purchased successfully",
  "data": {
    "reward": {
      "key": "neon_profile_frame",
      "name": "Neon Profile Frame",
      "description": "A glowing neon border for your profile",
      "xpCost": 1000
    },
    "remainingXP": 500
  }
}
```

### Daily

#### GET /api/daily
Get today's daily challenge.

**Response:**
```json
{
  "success": true,
  "message": "Daily challenge retrieved successfully",
  "data": {
    "challenge": { /* challenge object */ },
    "isNewDay": true
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Challenge not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## XP and Level System

### XP Rewards
- **Easy challenges**: 50 XP
- **Medium challenges**: 100 XP
- **Hard challenges**: 200 XP
- **Streak bonus**: +20 XP (after 5 consecutive days)

### Level Calculation
```
Level = floor(XP / 500) + 1
```

### Streak System
- Streak increments if user completes a challenge within 48 hours of the previous one
- Streak resets to 0 if more than 48 hours pass
- Streak bonus XP is awarded after 5 consecutive days

## Badge System

Badges are automatically unlocked based on achievements:

| Badge Key | Name | Description | Requirement |
|-----------|------|-------------|-------------|
| `first_solve` | First Challenge | Completed your first challenge | Complete 1 challenge |
| `five_solve` | Getting Started | Completed 5 challenges | Complete 5 challenges |
| `ten_solve` | On a Roll | Completed 10 challenges | Complete 10 challenges |
| `streak_5` | Streak Master | Maintained a 5-day streak | 5-day streak |
| `streak_10` | Consistency King | Maintained a 10-day streak | 10-day streak |
| `xp_1000` | XP Collector | Earned 1000 XP | Earn 1000 XP |
| `xp_5000` | XP Master | Earned 5000 XP | Earn 5000 XP |
| `easy_master` | Easy Master | Completed all easy challenges | Complete all easy challenges |
| `medium_master` | Medium Master | Completed all medium challenges | Complete all medium challenges |
| `hard_master` | Hard Master | Completed all hard challenges | Complete all hard challenges |

## Reward System

Rewards can be purchased with XP:

| Reward Key | Name | Description | Cost |
|------------|------|-------------|------|
| `neon_profile_frame` | Neon Profile Frame | A glowing neon border for your profile | 1000 XP |
| `custom_map_theme` | Custom Map Theme | Unlock a special theme for the adventure map | 2000 XP |
| `badge_animation_pack` | Badge Animation Pack | Special animations when earning badges | 3000 XP |
| `golden_username` | Golden Username | Make your username appear in gold | 1500 XP |
| `exclusive_avatar` | Exclusive Avatar | Unlock a special avatar design | 2500 XP |
| `premium_background` | Premium Background | Unlock a premium background for your profile | 1800 XP |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Challenge submission: 10 requests per minute
- General endpoints: 100 requests per minute

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure access and refresh tokens
- **Input Validation**: Zod schema validation
- **Security Headers**: Helmet middleware
- **CORS Protection**: Configurable origins
- **Code Execution**: Sandboxed with vm2 for code challenges

## Database Collections

The API uses 6 optimized collections:

1. **users** - User profiles, XP, streaks, badges, rewards
2. **challenges** - Challenge definitions and content
3. **attempts** - User challenge attempts (with TTL)
4. **meta** - Badges, rewards, and quest definitions
5. **sessions** - Refresh tokens (with TTL)
6. **migrations** - Migration and seed tracking

## Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Byte Club API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```
