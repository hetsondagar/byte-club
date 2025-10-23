import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  Target, 
  Clock, 
  Shield, 
  Bug, 
  Code, 
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Heart
} from 'lucide-react';
import { Button } from './ui/button';
import { GameState } from '@/hooks/useGameEngine';

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

// BYTECLUB: Powerup definitions
const POWERUP_DEFINITIONS = {
  tryCatch: {
    name: 'Try-Catch Shield',
    icon: <Shield className="w-4 h-4" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
    borderColor: 'border-cyan-400/50'
  },
  garbageCollector: {
    name: 'Garbage Collector',
    icon: <Bug className="w-4 h-4" />,
    color: 'text-lime-400',
    bgColor: 'bg-lime-400/20',
    borderColor: 'border-lime-400/50'
  },
  debuggerDrone: {
    name: 'Debugger Drone',
    icon: <Code className="w-4 h-4" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/20',
    borderColor: 'border-pink-400/50'
  },
  optimizationBoost: {
    name: 'Optimization Boost',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/50'
  }
};

interface ByteRushHUDProps {
  gameState: GameState;
  leaderboard: LeaderboardEntry[];
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

// BYTECLUB: Byte Rush HUD component for brick-breaker
export function ByteRushHUD({
  gameState,
  leaderboard,
  onPause,
  onResume,
  onRestart,
  onExit
}: ByteRushHUDProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // BYTECLUB: Console messages for ByteClub theme
  const getConsoleMessage = () => {
    if (gameState.isPaused) return '[SYS] Game paused. Press P to resume.';
    if (!gameState.isRunning && gameState.lives === 0) return '[BYTECLUB] Game over! Breaking code is hard work.';
    if (gameState.activePowerups.length > 0) return '[DEBUG] Powerup active! Breaking bricks with style.';
    if (gameState.combos > 0) return '[SYS] Combo streak! Keep breaking those bugs!';
    return '[BYTECLUB] Breaking deprecated code...';
  };

  return (
    <div className="w-[30%] h-full bg-gradient-to-b from-gray-900 to-black border-l border-cyan-400/30 p-6 overflow-y-auto">
      {/* BYTECLUB: Game Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Game Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Score:</span>
            <span className="text-white font-mono font-bold">{formatNumber(gameState.score)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Level:</span>
            <span className="text-white font-mono">{gameState.level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Bricks:</span>
            <span className="text-white font-mono">{gameState.bricksBroken}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Combos:</span>
            <span className="text-white font-mono">{gameState.combos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lives:</span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < gameState.lives ? 'text-red-400 fill-current' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BYTECLUB: Active Powerups */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Active Powerups
        </h3>
        <div className="space-y-2">
          <AnimatePresence>
            {gameState.activePowerups.length > 0 ? (
              gameState.activePowerups.map((powerup, index) => {
                const powerupDef = POWERUP_DEFINITIONS[powerup as keyof typeof POWERUP_DEFINITIONS];
                if (!powerupDef) return null;
                
                const remainingTime = gameState.powerupTimers[powerup] || 0;
                const progress = remainingTime / (powerup === 'optimizationBoost' ? 5000 : 3000);
                
                return (
                  <motion.div
                    key={powerup}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-lg border ${powerupDef.bgColor} ${powerupDef.borderColor}`}
                  >
                    <div className="flex items-center">
                      <div className={powerupDef.color}>
                        {powerupDef.icon}
                      </div>
                      <span className="ml-2 text-white font-semibold text-sm">
                        {powerupDef.name}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <motion.div
                          className="bg-cyan-400 h-1 rounded-full"
                          initial={{ width: "100%" }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.ceil(remainingTime / 1000)}s remaining
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-sm text-gray-400 italic">No active powerups</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BYTECLUB: Leaderboard */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Leaderboard
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-2 rounded-lg border ${
                    index === 0 ? 'bg-yellow-400/20 border-yellow-400/50' :
                    index === 1 ? 'bg-gray-400/20 border-gray-400/50' :
                    index === 2 ? 'bg-orange-400/20 border-orange-400/50' :
                    'bg-gray-800/20 border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-cyan-400 w-6">
                        #{entry.rank}
                      </span>
                      <span className="text-white font-semibold text-sm ml-2 truncate">
                        {entry.displayName}
                      </span>
                    </div>
                    <span className="text-cyan-400 font-mono text-sm">
                      {formatNumber(entry.score)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{entry.bricksBroken} bricks</span>
                    <span>{formatTime(entry.runDurationMs)}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic">Loading leaderboard...</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BYTECLUB: Game Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center">
          <Play className="w-5 h-5 mr-2" />
          Controls
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Move Paddle</span>
            <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">← →</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Pause</span>
            <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">P</kbd>
          </div>
        </div>
      </div>

      {/* BYTECLUB: Game Actions */}
      <div className="space-y-3">
        <Button
          onClick={gameState.isPaused ? onResume : onPause}
          variant="outline"
          size="sm"
          className="w-full bg-black/50 backdrop-blur-sm border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
        >
          {gameState.isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          )}
        </Button>
        
        <Button
          onClick={onRestart}
          variant="outline"
          size="sm"
          className="w-full bg-black/50 backdrop-blur-sm border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
        
        <Button
          onClick={onExit}
          variant="outline"
          size="sm"
          className="w-full bg-black/50 backdrop-blur-sm border-red-400/30 text-red-400 hover:bg-red-400/10"
        >
          Exit Game
        </Button>
      </div>

      {/* BYTECLUB: System Messages */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          System
        </h3>
        <div className="space-y-1 text-xs font-mono">
          <div className="text-green-400">[BYTECLUB] Game engine initialized</div>
          <div className="text-cyan-400">[SYS] Canvas renderer active</div>
          <div className="text-yellow-400">[DEBUG] Physics engine running</div>
          {gameState.isRunning && (
            <div className="text-lime-400">[GAME] Breaking bricks active</div>
          )}
          {gameState.isPaused && (
            <div className="text-orange-400">[GAME] Paused</div>
          )}
          <div className="text-cyan-400">{getConsoleMessage()}</div>
        </div>
      </div>
    </div>
  );
}