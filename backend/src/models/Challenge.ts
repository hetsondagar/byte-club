import mongoose, { Schema, Document } from 'mongoose';
import { Challenge as IChallenge } from '../types';

const challengeSchema = new Schema<IChallenge>({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true/false', 'code'],
    required: true
  },
  xpReward: {
    type: Number,
    required: true,
    min: 0
  },
  content: {
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true
    },
    codeSnippet: {
      type: String
    },
    testCases: [{
      input: { type: Schema.Types.Mixed },
      expected: { type: Schema.Types.Mixed }
    }],
    starterCode: {
      type: String
    },
    forbiddenMethods: [{
      type: String
    }]
  },
  tags: [{
    type: String,
    trim: true
  }],
  isDaily: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ type: 1 });
challengeSchema.index({ isDaily: 1, isActive: 1 });
challengeSchema.index({ tags: 1 });

export default mongoose.model<IChallenge & Document>('Challenge', challengeSchema);
