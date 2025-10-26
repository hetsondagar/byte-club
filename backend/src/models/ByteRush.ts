import mongoose, { Schema, model, Document, Model } from 'mongoose';

// BYTECLUB: Byte Rush Score Interface
export interface IByteRushScore extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number;
  wave: number;
  enemiesKilled: number;
  createdAt: Date;
}

// BYTECLUB: Byte Rush Score Schema
const ByteRushScoreSchema = new Schema<IByteRushScore>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    index: true
  },
  wave: {
    type: Number,
    required: true,
    default: 1
  },
  enemiesKilled: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// BYTECLUB: Static method to get leaderboard
ByteRushScoreSchema.statics.getLeaderboard = async function(limit: number = 10) {
  return this.find()
    .sort({ score: -1, createdAt: -1 })
    .limit(limit)
    .select('username score wave enemiesKilled createdAt');
};

// BYTECLUB: Static method to get user's best score
ByteRushScoreSchema.statics.getUserBestScore = async function(userId: mongoose.Types.ObjectId) {
  return this.findOne({ userId })
    .sort({ score: -1 })
    .select('username score wave enemiesKilled createdAt');
};

// BYTECLUB: Static method to get user's recent scores
ByteRushScoreSchema.statics.getUserRecentScores = async function(userId: mongoose.Types.ObjectId, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('username score wave enemiesKilled createdAt');
};

export interface IByteRushScoreModel extends Model<IByteRushScore> {
  getLeaderboard(limit?: number): Promise<IByteRushScore[]>;
  getUserBestScore(userId: mongoose.Types.ObjectId): Promise<IByteRushScore | null>;
  getUserRecentScores(userId: mongoose.Types.ObjectId, limit?: number): Promise<IByteRushScore[]>;
}

const ByteRushScore = mongoose.model<IByteRushScore, IByteRushScoreModel>('ByteRushScore', ByteRushScoreSchema);

export default ByteRushScore;
