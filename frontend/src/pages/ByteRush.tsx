import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { ByteRushGameCanvas, ByteRushGameCanvasRef } from '@/components/ByteRushGameCanvas';
import { ByteRushHUD } from '@/components/ByteRushHUD';
import { ByteRushGameOverModal } from '@/components/ByteRushGameOverModal';
import { ByteRushLeaderboard } from '@/components/ByteRushLeaderboard';
import { ByteRushGameState } from '@/hooks/useByteRushGameEngine';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { 
  Play, 
  Trophy, 
  Zap, 
  Target, 
  ArrowRight, 
  Gamepad2, 
  Users, 
  Clock,
  Star,
  Shield,
  Bug,
  Code,
  Sparkles
} from 'lucide-react';

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

// BYTECLUB: Byte Rush main page component
export default function ByteRush() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameCanvas, setShowGameCanvas] = useState(false);
  const [gameState, setGameState] = useState<ByteRushGameState>({
    score: 0,
    lives: 3,
    level: 1,
    isRunning: false,
    isPaused: false,
    speed: 2,
    blockSpawnRate: 60,
    gameTime: 0,
    multiplier: 1,
    consecutiveGood: 0
  });
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [runDuration, setRunDuration] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameStats, setGameStats] = useState<any>(null);

  const gameCanvasRef = useRef<ByteRushGameCanvasRef>(null);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast-Paced Action',
      description: 'Collect good blocks, avoid bad ones in this ByteClub-themed falling blocks game'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Powerups & Multipliers',
      description: 'Shield, Speed Boost, Score Multiplier - activate by collecting 5 consecutive good blocks'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Global Leaderboard',
      description: 'Compete with players worldwide and climb the rankings'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Progressive Difficulty',
      description: 'Speed and spawn rate increase every 30 seconds - can you survive?'
    }
  ];

  const powerups = [
    {
      name: 'Shield Powerup',
      icon: <Shield className="w-6 h-6" />,
      description: 'Protects from bad blocks for 5 seconds',
      color: 'text-purple-400'
    },
    {
      name: 'Speed Boost',
      icon: <Zap className="w-6 h-6" />,
      description: 'Increases player movement speed by 50% for 3 seconds',
      color: 'text-yellow-400'
    },
    {
      name: 'Score Multiplier',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Doubles your score for 5 seconds',
      color: 'text-orange-400'
    },
    {
      name: 'Combo System',
      icon: <Code className="w-6 h-6" />,
      description: 'Collect 5 consecutive good blocks to activate 2x multiplier',
      color: 'text-cyan-400'
    }
  ];

  // BYTECLUB: Handle game state changes from ByteRushGameCanvas
  const handleGameStateChange = (newGameState: ByteRushGameState) => {
    console.log('🎮 ByteRush: Game state changed:', {
      score: newGameState.score,
      lives: newGameState.lives,
      level: newGameState.level,
      isRunning: newGameState.isRunning,
      isPaused: newGameState.isPaused,
      multiplier: newGameState.multiplier
    });
    setGameState(newGameState);

    // BYTECLUB: Check for game over
    if (!newGameState.isRunning && gameStarted && newGameState.lives === 0) {
      console.log('🎮 ByteRush: Game Over! Score:', newGameState.score);
      setShowGameOver(true);
      setRunDuration(Date.now() - gameStartTime);
    }
  };

  // BYTECLUB: Handle game start
  const handleStartGame = () => {
    console.log('🎮 ByteRush: Starting game...');
    setGameStarted(true);
    setShowGameCanvas(true);
    setGameStartTime(Date.now());
    setShowGameOver(false);
    setRunDuration(0);
    console.log('🎮 ByteRush: Game started successfully');
  };

  // BYTECLUB: Handle game pause
  const handlePause = () => {
    // This will be handled by the GameCanvas component
  };

  // BYTECLUB: Handle game resume
  const handleResume = () => {
    // This will be handled by the GameCanvas component
  };

  // BYTECLUB: Handle game restart
  const handleRestart = () => {
    setGameStarted(false);
    setShowGameCanvas(false);
    setShowGameOver(false);
    setGameStartTime(0);
    setRunDuration(0);
    // Reset game state
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      isRunning: false,
      isPaused: false,
      speed: 2,
      blockSpawnRate: 60,
      gameTime: 0,
      multiplier: 1,
      consecutiveGood: 0
    });
    // Restart the game canvas
    if (gameCanvasRef.current) {
      gameCanvasRef.current.initializeGame();
    }
  };

  // BYTECLUB: Handle exit game
  const handleExit = () => {
    setGameStarted(false);
    setShowGameCanvas(false);
    setShowGameOver(false);
  };

  // BYTECLUB: Fetch leaderboard data
  const fetchLeaderboard = async () => {
    console.log('🎮 ByteRush: Fetching leaderboard...');
    try {
      const leaderboardData = await apiService.getByteRushLeaderboard(50);
      console.log('🎮 ByteRush: Leaderboard fetched successfully:', leaderboardData?.length, 'entries');
      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error('❌ ByteRush: Error fetching leaderboard:', error);
      console.error('❌ ByteRush: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setLeaderboard([]); // Set empty array on error
    }
  };

  // BYTECLUB: Fetch game statistics
  const fetchGameStats = async () => {
    console.log('🎮 ByteRush: Fetching game stats...');
    try {
      const statsData = await apiService.getByteRushStats();
      console.log('🎮 ByteRush: Game stats fetched successfully:', statsData);
      setGameStats(statsData || {
        totalPlayers: 0,
        totalScores: 0,
        averageScore: 0
      });
    } catch (error) {
      console.error('❌ ByteRush: Error fetching game stats:', error);
      console.error('❌ ByteRush: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setGameStats({
        totalPlayers: 0,
        totalScores: 0,
        averageScore: 0
      }); // Set default stats on error
    }
  };

  // BYTECLUB: Load game stats on component mount
  useEffect(() => {
    console.log('🎮 ByteRush: Component mounted, fetching data...');
    fetchLeaderboard();
    fetchGameStats();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BYTECLUB: Floating particles background */}
      <FloatingParticles 
        className="absolute inset-0 z-0" 
        quantity={50}
        ease={80}
        color="#00fff9"
        size={1}
      />
      
      {/* BYTECLUB: Matrix rain effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="matrix-rain text-cyan-400 text-xs font-mono">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="absolute animate-pulse" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}>
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* BYTECLUB: Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              BYTE RUSH
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
                         Fast-paced falling blocks game with ByteClub neon aesthetic. Collect good blocks, avoid bad ones, 
             use powerups strategically, and climb the global leaderboard!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              onClick={handleStartGame}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Run
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* BYTECLUB: Game Canvas - Hidden until game starts */}
        <AnimatePresence>
          {showGameCanvas && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            >
              <div className="flex h-full">
                {/* BYTECLUB: Game Canvas - Left 70% */}
                <div className="w-[70%] h-full relative">
                  <ByteRushGameCanvas ref={gameCanvasRef} onGameStateChange={handleGameStateChange} />
                </div>

                {/* BYTECLUB: HUD Panel - Right 30% */}
                <ByteRushHUD
                  gameState={gameState}
                  leaderboard={leaderboard}
                  onPause={handlePause}
                  onResume={handleResume}
                  onRestart={handleRestart}
                  onExit={handleExit}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BYTECLUB: Game Over Modal */}
        <ByteRushGameOverModal
          gameState={gameState}
          isOpen={showGameOver}
          onClose={() => setShowGameOver(false)}
          onRestart={handleRestart}
          onExit={handleExit}
          runDuration={runDuration}
        />

        {/* BYTECLUB: Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
            >
              <NeonCard className="h-full">
                <div className="text-center p-6">
                  <div className="text-cyan-400 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </motion.div>

        {/* BYTECLUB: Powerups Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Powerups & Abilities
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {powerups.map((powerup, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
              >
                <NeonCard className="h-full">
                  <div className="p-6">
                    <div className={`${powerup.color} mb-4 flex items-center`}>
                      {powerup.icon}
                      <h3 className="text-lg font-bold ml-2">{powerup.name}</h3>
                    </div>
                    <p className="text-gray-400">{powerup.description}</p>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* BYTECLUB: Game Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-center"
        >
          <NeonCard className="max-w-4xl mx-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">Game Statistics</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{gameStats?.totalPlayers || 0}</div>
                  <div className="text-gray-400">Total Players</div>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{gameStats?.totalScores || 0}</div>
                  <div className="text-gray-400">Total Scores</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{leaderboard[0]?.score.toLocaleString() || 0}</div>
                  <div className="text-gray-400">High Score</div>
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>
      </div>
    </div>
  );
}
