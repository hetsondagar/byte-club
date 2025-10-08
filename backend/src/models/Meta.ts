import mongoose, { Schema, Document } from 'mongoose';
import { Meta as IMeta } from '../types';

const metaSchema = new Schema<IMeta>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['badge', 'reward', 'quest'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  xpReward: {
    type: Number,
    min: 0
  },
  xpCost: {
    type: Number,
    min: 0
  },
  icon: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
metaSchema.index({ type: 1 });
metaSchema.index({ type: 1, key: 1 });

export default mongoose.model<IMeta & Document>('Meta', metaSchema);
