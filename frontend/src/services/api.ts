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

  async updateProfile(data: { username?: string; email?: string; password?: string; badges?: string[]; totalXP?: number; triggerBadgeCheck?: boolean }): Promise<User> {
    const response = await this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      // Update localStorage with new user data
      const currentUser = localStorage.getItem('byteclub_user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        const updatedUser = {
          ...parsedUser,
          ...response.data
        };
        localStorage.setItem('byteclub_user', JSON.stringify(updatedUser));
      }
    }

    return response.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me');
    // Handle both response structures: { data: {...} } and { data: { user: {...} } }
    if (response.data?.user) {
      return response.data.user;
    }
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

  async getChallengesFiltered(params?: { type?: string; tags?: string[]; isDaily?: boolean }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.isDaily !== undefined) query.set('isDaily', String(params.isDaily));
    if (params?.tags && params.tags.length) {
      for (const t of params.tags) query.append('tags', t);
    }
    const qs = query.toString();
    const response = await this.request<any>(`/challenges${qs ? `?${qs}` : ''}`);
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

  async submitChallenge(slug: string, answer: string | number, completionTimeMs?: number | null): Promise<any> {
    // Get frontend streak data to sync with backend
    const frontendStreak = this.getFrontendStreak();
    
    const response = await this.request(`/challenges/${slug}/submit`, {
      method: 'POST',
      body: JSON.stringify({ 
        answer, 
        completionTimeMs,
        frontendStreak 
      }),
    });
    return response.data!;
  }
  
  private getFrontendStreak(): number {
    try {
      const userData = localStorage.getItem('byteclub_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.currentStreak || 0;
      }
    } catch (error) {
      console.error('Error getting frontend streak:', error);
    }
    return 0;
  }

  async runCode(slug: string, code: string, language?: string): Promise<{ success: boolean; results: any[]; error?: string; stderr?: string; compile_output?: string; }> {
    const response = await this.request<{ success: boolean; results: any[]; error?: string; stderr?: string; compile_output?: string }>(`/challenges/${slug}/run`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
    return response.data!;
  }

  async runCodeSandbox(code: string, testCases?: Array<{ input: any; expected: any; }>, language?: string): Promise<{ success: boolean; results: any[]; error?: string; stderr?: string; compile_output?: string; }> {
    const response = await this.request<{ success: boolean; results: any[]; error?: string; stderr?: string; compile_output?: string }>(`/challenges/run`, {
      method: 'POST',
      body: JSON.stringify({ code, testCases, language }),
    });
    return response.data!;
  }


  // Leaderboard
  async getLeaderboard(type: 'all-time' | 'challenges' | 'adventure' | 'quests' = 'all-time'): Promise<any[]> {
    try {
      const response = await this.request<any>(`/users/leaderboard?type=${type}`);
      console.log(`Leaderboard API response for ${type}:`, response);
      
      // Handle response structure: { data: { leaderboard: [...] } }
      if (response.data?.leaderboard) {
        console.log(`Leaderboard data for ${type}:`, response.data.leaderboard);
        return response.data.leaderboard;
      }
      
      console.log(`Direct data for ${type}:`, response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching leaderboard for ${type}:`, error);
      throw error;
    }
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

  // Quest methods
  async getQuests(): Promise<any[]> {
    const response = await this.request<any>('/quests');
    if (response.data?.quests) {
      return response.data.quests;
    }
    return response.data || [];
  }

  async getQuest(questId: string): Promise<any> {
    const response = await this.request<any>(`/quests/${questId}`);
    return response.data!;
  }

  async getQuestProgress(questId: string): Promise<any> {
    const response = await this.request<any>(`/quests/${questId}/progress`);
    return response.data!;
  }

  async getCompletedMissions(questId: string): Promise<string[]> {
    const response = await this.request<any>(`/quests/${questId}/missions/completed`);
    if (response.data?.completedMissions) {
      return response.data.completedMissions;
    }
    return response.data || [];
  }

  async submitMission(questId: string, missionId: string, answer: string): Promise<any> {
    const response = await this.request<any>(`/quests/${questId}/missions/${missionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    // Backend may return either { success, ... } or { success, data: {...} }
    // Normalize to return the payload object
    const payload = (response as any)?.data ?? response;
    return payload;
  }

  async getQuestStats(): Promise<any> {
    const response = await this.request<any>('/quests/stats/overview');
    return response.data!;
  }

  // Adventure Map methods
  async completeAdventureNode(nodeId: string, xp: number): Promise<any> {
    const response = await this.request<any>('/adventure/complete', {
      method: 'POST',
      body: JSON.stringify({ nodeId, xp }),
    });
    return response.data!;
  }

  async getAdventureProgress(): Promise<any> {
    const response = await this.request<any>('/adventure/progress');
    return response.data!;
  }

  // BYTECLUB: Generic HTTP methods for Byte Rush and other components
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // BYTECLUB: Byte Rush Game methods
  async getByteRushLeaderboard(limit: number = 10): Promise<any[]> {
    const response = await this.get<any>(`/byterush/leaderboard?limit=${limit}`);
    if (response.success && response.data?.leaderboard) {
      return response.data.leaderboard;
    }
    return [];
  }

  async getByteRushStats(): Promise<any> {
    const response = await this.get<any>('/byterush/stats');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async submitByteRushScore(scoreData: { score: number; wave: number; enemiesKilled: number }): Promise<any> {
    const response = await this.post<any>('/byterush/score', scoreData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to submit score');
  }

  async getByteRushUserBestScore(): Promise<any> {
    const response = await this.get<any>('/byterush/me/best');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async getByteRushUserRecentScores(limit: number = 10): Promise<any[]> {
    const response = await this.get<any>(`/byterush/me/recent?limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
}

export const apiService = new ApiService();
export default apiService;
