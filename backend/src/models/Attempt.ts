import mongoose, { Schema, Document } from 'mongoose';
import { Attempt as IAttempt } from '../types';

const attemptSchema = new Schema<IAttempt>({
  userId: {
    type: String,
    required: true
  },
  challengeSlug: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  xpEarned: {
    type: Number,
    required: true,
    min: 0
  },
  completionTimeMs: {
    type: Number,
    required: false,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
attemptSchema.index({ userId: 1, challengeSlug: 1 });
attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ challengeSlug: 1 });
attemptSchema.index({ createdAt: -1 }); // For weekly leaderboard
attemptSchema.index({ isCorrect: 1 });

// TTL index to clean up old attempts (optional - 90 days)
attemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<IAttempt>('Attempt', attemptSchema);
