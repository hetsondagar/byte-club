import mongoose, { Document, Schema } from 'mongoose';

// BYTECLUB: Byte Rush score interface for MongoDB storage
export interface IByteRushScore extends Document {
  userId?: string;
  displayName: string;
  score: number;
  distance: number;
  commits: number;
  runDurationMs: number;
  powerupsUsed: string[];
  clientGameVersion: string;
  createdAt: Date;
}

// BYTECLUB: Schema for storing Byte Rush game scores with anti-cheat validation
const ByteRushScoreSchema = new Schema<IByteRushScore>({
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
  distance: {
    type: Number,
    required: true,
    min: 0,
    max: 50000 // Reasonable max distance limit
  },
  commits: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Reasonable max commits limit
  },
  runDurationMs: {
    type: Number,
    required: true,
    min: 1000, // Minimum 1 second run
    max: 600000 // Maximum 10 minutes run
  },
  powerupsUsed: [{
    type: String,
    enum: ['tryCatch', 'garbageCollector', 'debuggerDrone', 'optimizationBoost', 'hotfix']
  }],
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
  // Validate score-distance ratio (should be reasonable)
  const scorePerDistance = this.score / Math.max(this.distance, 1);
  if (scorePerDistance > 10) { // More than 10 points per distance unit seems suspicious
    return next(new Error('Invalid score-to-distance ratio detected'));
  }

  // Validate commits-distance ratio (should be reasonable)
  const commitsPerDistance = this.commits / Math.max(this.distance, 1);
  if (commitsPerDistance > 0.1) { // More than 0.1 commits per distance unit seems suspicious
    return next(new Error('Invalid commits-to-distance ratio detected'));
  }

  // Validate run duration vs distance (should be reasonable)
  const distancePerSecond = this.distance / (this.runDurationMs / 1000);
  if (distancePerSecond > 50) { // More than 50 distance units per second seems suspicious
    return next(new Error('Invalid distance-to-duration ratio detected'));
  }

  next();
});

// BYTECLUB: Static method to get leaderboard
ByteRushScoreSchema.statics.getLeaderboard = async function(limit: number = 50) {
  return this.find({})
    .sort({ score: -1, runDurationMs: 1, createdAt: -1 })
    .limit(limit)
    .select('displayName score distance commits runDurationMs powerupsUsed createdAt')
    .lean();
};

// BYTECLUB: Static method to get user's best score
ByteRushScoreSchema.statics.getUserBestScore = async function(userId: string) {
  return this.findOne({ userId })
    .sort({ score: -1, runDurationMs: 1 })
    .select('displayName score distance commits runDurationMs powerupsUsed createdAt')
    .lean();
};

// BYTECLUB: Static method to get user's recent scores
ByteRushScoreSchema.statics.getUserRecentScores = async function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('displayName score distance commits runDurationMs powerupsUsed createdAt')
    .lean();
};

export const ByteRushScore = mongoose.model<IByteRushScore>('ByteRushScore', ByteRushScoreSchema);

// BYTECLUB: Powerup definitions for game logic
export const POWERUP_DEFINITIONS = {
  tryCatch: {
    name: 'Try-Catch Shield',
    description: 'Protects from one collision',
    duration: 5000, // 5 seconds
    color: '#00fff9' // Neon cyan
  },
  garbageCollector: {
    name: 'Garbage Collector',
    description: 'Clears obstacles ahead',
    duration: 3000, // 3 seconds
    color: '#7fff00' // Lime
  },
  debuggerDrone: {
    name: 'Debugger Drone',
    description: 'Collects nearby commits automatically',
    duration: 8000, // 8 seconds
    color: '#ff3bcf' // Magenta
  },
  optimizationBoost: {
    name: 'Optimization Boost',
    description: 'Slows time and increases score multiplier',
    duration: 4000, // 4 seconds
    color: '#a020f0' // Electric purple
  },
  hotfix: {
    name: 'Hotfix',
    description: 'Respawn with invincibility',
    duration: 2000, // 2 seconds
    color: '#ff6b35' // Orange
  }
} as const;

// BYTECLUB: Game configuration constants
export const GAME_CONFIG = {
  MAX_SCORE: 1000000,
  MAX_DISTANCE: 50000,
  MAX_COMMITS: 1000,
  MIN_RUN_DURATION: 1000, // 1 second
  MAX_RUN_DURATION: 600000, // 10 minutes
  SCORE_MULTIPLIER: {
    COMMIT: 100,
    DISTANCE: 1,
    POWERUP_USED: 50
  },
  COLLISION_PENALTY: 1000,
  POWERUP_SPAWN_RATE: 0.1, // 10% chance per obstacle
  OBSTACLE_SPAWN_RATE: 0.3, // 30% chance per frame
  COMMIT_SPAWN_RATE: 0.2 // 20% chance per frame
} as const;
