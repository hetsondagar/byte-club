import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  Share2, 
  RotateCcw, 
  X,
  Star,
  TrendingUp,
  Award,
  Bug
} from 'lucide-react';
import { Button } from './ui/button';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { GameState } from '@/hooks/useGameEngine';

interface ByteRushGameOverModalProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onExit: () => void;
  runDuration: number;
}

// BYTECLUB: Byte Rush Game Over Modal component for brick-breaker
export function ByteRushGameOverModal({
  gameState,
  isOpen,
  onClose,
  onRestart,
  onExit,
  runDuration
}: ByteRushGameOverModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.username || 'Anonymous');

  // BYTECLUB: Submit score to leaderboard
  const submitScore = async () => {
    if (submitting || submitted) return;

    try {
      setSubmitting(true);
      setError(null);

      const scoreData = {
        userId: user?.id,
        displayName: displayName.trim() || 'Anonymous',
        score: gameState.score,
        bricksBroken: gameState.bricksBroken,
        powerupsUsed: gameState.activePowerups,
        runDurationMs: runDuration,
        clientGameVersion: '1.0.0'
      };

      const response = await apiService.post('/byte-rush/score', scoreData);

      if (response.success) {
        setSubmitted(true);
        setRank(response.data.rank);
      } else {
        setError(response.message || 'Failed to submit score');
      }
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // BYTECLUB: Share score
  const shareScore = async () => {
    const shareText = `I just broke ${gameState.bricksBroken} bricks and scored ${gameState.score.toLocaleString()} points in Byte Rush! 🎮⚡\n\nLevel: ${gameState.level}\nCombos: ${gameState.combos}\nDuration: ${Math.floor(runDuration / 1000)}s\n\nPlay Byte Rush at ByteClub! 🚀`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Byte Rush Score',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getScoreRating = (score: number) => {
    if (score >= 50000) return { rating: 'LEGENDARY', color: 'text-yellow-400', icon: <Award className="w-6 h-6" /> };
    if (score >= 25000) return { rating: 'EPIC', color: 'text-purple-400', icon: <Star className="w-6 h-6" /> };
    if (score >= 10000) return { rating: 'GREAT', color: 'text-cyan-400', icon: <Trophy className="w-6 h-6" /> };
    if (score >= 5000) return { rating: 'GOOD', color: 'text-green-400', icon: <TrendingUp className="w-6 h-6" /> };
    return { rating: 'NICE TRY', color: 'text-orange-400', icon: <Bug className="w-6 h-6" /> };
  };

  const scoreRating = getScoreRating(gameState.score);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-cyan-400/30 rounded-xl p-8 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BYTECLUB: Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* BYTECLUB: Game Over Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="text-4xl font-bold text-red-400 mb-2"
              >
                GAME OVER
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`flex items-center justify-center space-x-2 ${scoreRating.color}`}
              >
                {scoreRating.icon}
                <span className="text-xl font-bold">{scoreRating.rating}</span>
              </motion.div>
            </div>

            {/* BYTECLUB: Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-600/30"
            >
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  {formatNumber(gameState.score)}
                </div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-white font-semibold">{gameState.bricksBroken}</div>
                  <div className="text-gray-400">Bricks Broken</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{gameState.level}</div>
                  <div className="text-gray-400">Level Reached</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{gameState.combos}</div>
                  <div className="text-gray-400">Combos</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{formatTime(runDuration)}</div>
                  <div className="text-gray-400">Duration</div>
                </div>
              </div>
            </motion.div>

            {/* BYTECLUB: Submit Score Section */}
            {!submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter your name"
                    maxLength={50}
                  />
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm mb-4">{error}</div>
                )}
                
                <Button
                  onClick={submitScore}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Submit to Leaderboard
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6 text-center"
              >
                <div className="text-green-400 font-semibold mb-2">
                  ✅ Score Submitted Successfully!
                </div>
                {rank && (
                  <div className="text-cyan-400">
                    Your rank: <span className="font-bold">#{rank}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* BYTECLUB: Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <Button
                onClick={shareScore}
                variant="outline"
                className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Score
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onRestart}
                  variant="outline"
                  className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
                
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  Exit Game
                </Button>
              </div>
            </motion.div>

            {/* BYTECLUB: ByteClub Branding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center mt-6 pt-4 border-t border-gray-600/30"
            >
              <div className="text-xs text-gray-500 font-mono">
                [BYTECLUB] Brick-breaking session complete. Great work! 🚀
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}