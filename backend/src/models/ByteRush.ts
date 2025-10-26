import mongoose, { Document, Schema } from 'mongoose';

// BYTECLUB: Byte Rush brick-breaker score interface for MongoDB storage
export interface IByteRushScore extends Document {
  userId?: string;
  displayName: string;
  score: number;
  bricksBroken: number;
  powerupsUsed: string[];
  runDurationMs: number;
  clientGameVersion: string;
  createdAt: Date;
}

// BYTECLUB: Interface for model static methods
interface IByteRushScoreModel extends mongoose.Model<IByteRushScore> {
  getLeaderboard(limit?: number): Promise<IByteRushScore[]>;
  getUserBestScore(userId: string): Promise<IByteRushScore | null>;
  getUserRecentScores(userId: string, limit?: number): Promise<IByteRushScore[]>;
}

// BYTECLUB: Schema for storing Byte Rush brick-breaker scores with anti-cheat validation
const ByteRushScoreSchema = new Schema<IByteRushScore, IByteRushScoreModel>({
  userId: {
    type: String,
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  displayName: {
    type: String,
    required: true,
    default: 'Anonymous',
    maxlength: 50,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000, // Reasonable max score limit
    index: true
  },
  bricksBroken: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Reasonable max bricks limit
  },
  powerupsUsed: [{
    type: String,
    enum: ['tryCatch', 'garbageCollector', 'debuggerDrone', 'optimizationBoost']
  }],
  runDurationMs: {
    type: Number,
    required: true,
    min: 1000, // Minimum 1 second run
    max: 600000 // Maximum 10 minutes run
  },
  clientGameVersion: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// BYTECLUB: Compound index for leaderboard queries - score DESC, runDurationMs ASC, createdAt DESC
ByteRushScoreSchema.index({ score: -1, runDurationMs: 1, createdAt: -1 });

// BYTECLUB: Index for user-specific queries
ByteRushScoreSchema.index({ userId: 1, createdAt: -1 });

// BYTECLUB: TTL index to automatically remove old scores (optional - keeps DB clean)
// Uncomment if you want to auto-delete scores older than 30 days
// ByteRushScoreSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// BYTECLUB: Pre-save validation to prevent cheating
ByteRushScoreSchema.pre('save', function(next) {
  // Validate score-bricks ratio (should be reasonable)
  const scorePerBrick = this.score / Math.max(this.bricksBroken, 1);
  if (scorePerBrick > 200) { // More than 200 points per brick seems suspicious
    return next(new Error('Invalid score-to-bricks ratio detected'));
  }

  // Validate bricks per second (should be reasonable)
  const bricksPerSecond = this.bricksBroken / (this.runDurationMs / 1000);
  if (bricksPerSecond > 5) { // More than 5 bricks per second seems suspicious
    return next(new Error('Invalid bricks-per-second ratio detected'));
  }

  // Validate minimum score for given bricks
  const expectedMinScore = this.bricksBroken * 50; // 50 points per brick minimum
  if (this.score < expectedMinScore * 0.5) { // Allow some variance
    return next(new Error('Score too low for number of bricks broken'));
  }

  next();
});

// BYTECLUB: Static method to get leaderboard
ByteRushScoreSchema.statics.getLeaderboard = async function(limit: number = 50) {
  return this.find({})
    .sort({ score: -1, runDurationMs: 1, createdAt: -1 })
    .limit(limit)
    .select('displayName score bricksBroken runDurationMs powerupsUsed createdAt')
    .lean();
};

// BYTECLUB: Static method to get user's best score
ByteRushScoreSchema.statics.getUserBestScore = async function(userId: string) {
  return this.findOne({ userId })
    .sort({ score: -1, runDurationMs: 1 })
    .select('displayName score bricksBroken runDurationMs powerupsUsed createdAt')
    .lean();
};

// BYTECLUB: Static method to get user's recent scores
ByteRushScoreSchema.statics.getUserRecentScores = async function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('displayName score bricksBroken runDurationMs powerupsUsed createdAt')
    .lean();
};

export const ByteRushScore = mongoose.model<IByteRushScore, IByteRushScoreModel>('ByteRushScore', ByteRushScoreSchema);

// BYTECLUB: Powerup definitions for brick-breaker game logic
export const POWERUP_DEFINITIONS = {
  tryCatch: {
    name: 'Try-Catch Shield',
    description: 'Paddle invincible for 3 seconds',
    duration: 3000, // 3 seconds
    color: '#00fff9' // Neon cyan
  },
  garbageCollector: {
    name: 'Garbage Collector',
    description: 'Clears 1-2 rows of bricks',
    duration: 0, // Instant effect
    color: '#7fff00' // Lime
  },
  debuggerDrone: {
    name: 'Debugger Drone',
    description: 'Auto-bounce for 3 seconds (ball never misses)',
    duration: 3000, // 3 seconds
    color: '#ff3bcf' // Magenta
  },
  optimizationBoost: {
    name: 'Optimization Boost',
    description: 'Slows ball speed temporarily',
    duration: 5000, // 5 seconds
    color: '#a020f0' // Electric purple
  }
} as const;

// BYTECLUB: Game configuration constants for brick-breaker
export const GAME_CONFIG = {
  MAX_SCORE: 1000000,
  MAX_BRICKS: 1000,
  MIN_RUN_DURATION: 1000, // 1 second
  MAX_RUN_DURATION: 600000, // 10 minutes
  SCORE_MULTIPLIER: {
    BRICK: 50,
    POWERUP_USED: 25,
    COMBO: 100
  },
  POWERUP_SPAWN_RATE: 0.1, // 10% chance per brick
  BRICK_ROWS: 8, // Number of brick rows
  BRICKS_PER_ROW: 10 // Number of bricks per row
} as const;
