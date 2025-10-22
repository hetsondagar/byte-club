import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types';
import { calculateLevel } from '../utils/xp';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastChallengeDate: {
    type: Date
  },
  completedChallenges: [{
    type: String
  }],
  completedAdventureNodes: [{
    type: String
  }],
  badges: [{
    type: String
  }],
  rewards: [{
    type: String
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ totalXP: -1 }); // For leaderboard
userSchema.index({ currentLevel: -1 });


// Virtual for level calculation
userSchema.virtual('calculatedLevel').get(function() {
  return calculateLevel(this.totalXP);
});

// Method to update level based on XP
userSchema.methods.updateLevel = function() {
  const newLevel = calculateLevel(this.totalXP);
  if (newLevel !== this.currentLevel) {
    this.currentLevel = newLevel;
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model<IUser>('User', userSchema);
