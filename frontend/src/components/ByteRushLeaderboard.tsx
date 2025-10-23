import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Clock, Target, Zap } from 'lucide-react';
import { apiService } from '@/services/api';

// BYTECLUB: Leaderboard entry interface
interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  bricksBroken: number;
  runDurationMs: number;
  powerupsUsed: string[];
  createdAt: Date;
}

// BYTECLUB: Game statistics interface
interface GameStats {
  totalScores: number;
  totalPlayers: number;
  registeredPlayers: number;
  anonymousPlayers: number;
  averageScore: number;
  averageBricks: number;
  powerupUsage: Array<{
    powerup: string;
    count: number;
    percentage: number;
  }>;
  lastUpdated: string;
}

// BYTECLUB: Byte Rush Leaderboard component for brick-breaker
export function ByteRushLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // BYTECLUB: Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/byte-rush/leaderboard?limit=50');
      
      if (response.success) {
        setLeaderboard(response.data.leaderboard);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // BYTECLUB: Fetch game statistics
  const fetchGameStats = async () => {
    try {
      const response = await apiService.get('/byte-rush/stats');
      
      if (response.success) {
        setGameStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching game stats:', err);
    }
  };

  // BYTECLUB: Load data on component mount
  useEffect(() => {
    fetchLeaderboard();
    fetchGameStats();
  }, []);

  // BYTECLUB: Auto-refresh leaderboard every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="text-cyan-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400/20 border-yellow-400/50';
      case 2:
        return 'bg-gray-400/20 border-gray-400/50';
      case 3:
        return 'bg-orange-400/20 border-orange-400/50';
      default:
        return 'bg-gray-800/20 border-gray-600/30';
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-400 mb-4">⚠️ {error}</div>
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-400/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BYTECLUB: Game Statistics */}
      {gameStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-sm text-gray-400">Players</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(gameStats.totalPlayers)}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <div className="flex items-center mb-2">
              <Trophy className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-sm text-gray-400">Scores</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(gameStats.totalScores)}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-sm text-gray-400">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(gameStats.averageScore)}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-sm text-gray-400">Avg Bricks</span>
            </div>
            <div className="text-2xl font-bold text-white">{Math.floor(gameStats.averageBricks)}</div>
          </div>
        </motion.div>
      )}

      {/* BYTECLUB: Leaderboard Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          Leaderboard
        </h2>
        <div className="text-sm text-gray-400">
          Last updated: {formatDate(lastUpdated)}
        </div>
      </div>

      {/* BYTECLUB: Leaderboard Entries */}
      <div className="space-y-2">
        <AnimatePresence>
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 rounded-lg border ${getRankColor(entry.rank)} hover:bg-opacity-30 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {entry.displayName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(entry.createdAt)} • {formatTime(entry.runDurationMs)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {formatNumber(entry.score)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {entry.bricksBroken} bricks
                  </div>
                </div>
              </div>
              
              {/* BYTECLUB: Powerups Used */}
              {entry.powerupsUsed.length > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div className="flex space-x-1">
                    {entry.powerupsUsed.map((powerup, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded-full"
                      >
                        {powerup}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BYTECLUB: Empty State */}
      {leaderboard.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Scores Yet</h3>
          <p className="text-gray-500">Be the first to play Byte Rush and break some bricks!</p>
        </div>
      )}

      {/* BYTECLUB: Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="px-6 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
        </button>
      </div>
    </div>
  );
}