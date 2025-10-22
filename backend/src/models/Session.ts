import mongoose, { Schema, Document } from 'mongoose';
import { Session as ISession } from '../types';

const sessionSchema = new Schema<ISession>({
  userId: {
    type: String,
    required: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
sessionSchema.index({ userId: 1 });
sessionSchema.index({ tokenHash: 1 });

// TTL index to automatically expire sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', sessionSchema);
