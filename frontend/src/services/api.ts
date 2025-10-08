import { config } from '@/config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  badges: string[];
  rewards: string[];
  role: string;
  completedChallenges?: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('byteclub_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${config.apiBaseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      // API request logging disabled
      
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // API logging disabled to prevent sensitive data exposure
      return data;
    } catch (error) {
      // Error logging disabled
      throw error;
    }
  }

  // Authentication methods
  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data) {
      // Store token for future requests
      localStorage.setItem('byteclub_token', response.data.accessToken);
      localStorage.setItem('byteclub_user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      // Store token for future requests
      localStorage.setItem('byteclub_token', response.data.accessToken);
      localStorage.setItem('byteclub_user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear stored data regardless of API response
      localStorage.removeItem('byteclub_token');
      localStorage.removeItem('byteclub_user');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data!;
  }

  // Challenge methods
  async getChallenges(): Promise<any[]> {
    const response = await this.request<any>('/challenges');
    // Handle both response structures: { data: [...] } and { data: { challenges: [...] } }
    if (response.data?.challenges) {
      return response.data.challenges;
    }
    return response.data || [];
  }

  async getChallenge(slug: string): Promise<any> {
    const response = await this.request<any>(`/challenges/${slug}`);
    // Handle both response structures: { data: {...} } and { data: { challenge: {...} } }
    if (response.data?.challenge) {
      return response.data.challenge;
    }
    return response.data!;
  }

  async submitChallenge(slug: string, answer: string | number): Promise<any> {
    const response = await this.request(`/challenges/${slug}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    return response.data!;
  }

  // Daily challenge
  async getDailyChallenge(): Promise<any> {
    const response = await this.request('/daily');
    return response.data!;
  }

  // Leaderboard
  async getLeaderboard(type: 'all-time' | 'weekly' = 'all-time'): Promise<any[]> {
    const response = await this.request<any>(`/users/leaderboard?type=${type}`);
    // Handle response structure: { data: { leaderboard: [...] } }
    if (response.data?.leaderboard) {
      return response.data.leaderboard;
    }
    return response.data || [];
  }

  // User methods
  async getUser(userId: string): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`);
    return response.data!;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  // Meta methods
  async getMeta(type: 'badge' | 'reward' | 'quest'): Promise<any> {
    const response = await this.request<any>(`/meta/${type}`);
    // Handle both response structures: { data: [...] } and { data: { items: [...] } }
    if (response.data?.items) {
      return response;
    }
    return response;
  }

  // Rewards
  async purchaseReward(rewardKey: string): Promise<any> {
    const response = await this.request(`/rewards/purchase/${rewardKey}`, {
      method: 'POST',
    });
    return response.data!;
  }
}

export const apiService = new ApiService();
export default apiService;
