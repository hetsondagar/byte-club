export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  lastChallengeDate?: Date;
  completedChallenges: string[];
  badges: string[];
  rewards: string[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'true/false' | 'code';
  xpReward: number;
  content: {
    question: string;
    options?: string[];
    correctAnswer: string | number;
    codeSnippet?: string;
  };
  tags: string[];
  isDaily: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  _id: string;
  userId: string;
  challengeSlug: string;
  isCorrect: boolean;
  xpEarned: number;
  createdAt: Date;
}

export interface Meta {
  _id: string;
  key: string;
  type: 'badge' | 'reward' | 'quest';
  name: string;
  description: string;
  xpReward?: number;
  xpCost?: number;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Migration {
  _id: string;
  name: string;
  appliedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChallengeSubmission {
  answer: string | number;
}

export interface LeaderboardEntry {
  user: {
    _id: string;
    username: string;
    totalXP: number;
    currentLevel: number;
  };
  rank: number;
}

export interface DailyChallengeResponse {
  challenge: Challenge;
  isNewDay: boolean;
}
