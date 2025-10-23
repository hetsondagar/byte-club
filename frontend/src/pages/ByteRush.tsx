import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { GameCanvas } from '@/components/GameCanvas';
import { ByteRushHUD } from '@/components/ByteRushHUD';
import { ByteRushGameOverModal } from '@/components/ByteRushGameOverModal';
import { useByteRushSocket } from '@/hooks/useByteRushSocket';
import { useAuth } from '@/contexts/AuthContext';
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

// BYTECLUB: Game state interface
interface GameState {
  score: number;
  distance: number;
  commits: number;
  isRunning: boolean;
  isPaused: boolean;
  gameSpeed: number;
  playerPosition: { x: number; y: number; z: number };
  activePowerups: string[];
  obstacles: any[];
  collectibles: any[];
}

// BYTECLUB: Byte Rush main page component
export default function ByteRush() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameCanvas, setShowGameCanvas] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    distance: 0,
    commits: 0,
    isRunning: false,
    isPaused: false,
    gameSpeed: 1,
    playerPosition: { x: 0, y: 0, z: 0 },
    activePowerups: [],
    obstacles: [],
    collectibles: []
  });
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [runDuration, setRunDuration] = useState<number>(0);

  // BYTECLUB: Socket connection for real-time features
  const {
    isConnected,
    connectedUsers,
    leaderboard,
    gameStats,
    error: socketError,
    submitScore,
    refreshLeaderboard,
    getGameStats,
    activatePowerup,
    updatePlayerPosition
  } = useByteRushSocket();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Endless runner with WebGL-powered 3D graphics'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Powerups Galore',
      description: 'Try-Catch Shield, Garbage Collector, Debugger Drone & more'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Real-time Leaderboard',
      description: 'Compete with players worldwide in live rankings'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Neon Aesthetic',
      description: 'Immersive cyber-terminal universe with glow effects'
    }
  ];

  const powerups = [
    {
      name: 'Try-Catch Shield',
      icon: <Shield className="w-6 h-6" />,
      description: 'Protects from one collision',
      color: 'text-cyan-400'
    },
    {
      name: 'Garbage Collector',
      icon: <Bug className="w-6 h-6" />,
      description: 'Clears obstacles ahead',
      color: 'text-lime-400'
    },
    {
      name: 'Debugger Drone',
      icon: <Code className="w-6 h-6" />,
      description: 'Collects nearby commits automatically',
      color: 'text-pink-400'
    },
    {
      name: 'Optimization Boost',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Slows time and increases score multiplier',
      color: 'text-purple-400'
    },
    {
      name: 'Hotfix',
      icon: <Zap className="w-6 h-6" />,
      description: 'Respawn with invincibility',
      color: 'text-orange-400'
    }
  ];

  // BYTECLUB: Handle game state changes from GameCanvas
  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState);
    
    // BYTECLUB: Update player position via socket
    updatePlayerPosition({
      x: newGameState.playerPosition.x,
      y: newGameState.playerPosition.y,
      z: newGameState.playerPosition.z,
      speed: newGameState.gameSpeed
    });

    // BYTECLUB: Check for game over
    if (!newGameState.isRunning && gameStarted) {
      setShowGameOver(true);
      setRunDuration(Date.now() - gameStartTime);
    }
  };

  // BYTECLUB: Handle game start
  const handleStartGame = () => {
    setGameStarted(true);
    setShowGameCanvas(true);
    setGameStartTime(Date.now());
    setShowGameOver(false);
    setRunDuration(0);
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
      distance: 0,
      commits: 0,
      isRunning: false,
      isPaused: false,
      gameSpeed: 1,
      playerPosition: { x: 0, y: 0, z: 0 },
      activePowerups: [],
      obstacles: [],
      collectibles: []
    });
  };

  // BYTECLUB: Handle exit game
  const handleExit = () => {
    setGameStarted(false);
    setShowGameCanvas(false);
    setShowGameOver(false);
  };

  // BYTECLUB: Handle powerup activation
  const handlePowerupActivation = (powerup: string, position: { x: number; y: number; z: number }) => {
    activatePowerup(powerup, position);
  };

  // BYTECLUB: Load game stats on component mount
  useEffect(() => {
    if (isConnected) {
      refreshLeaderboard();
      getGameStats();
    }
  }, [isConnected]);

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
            Endless runner inside a glowing cyber-terminal universe. Dodge bugs, collect commits, 
            and activate powerups in this WebGL-powered ByteClub mini-game.
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
                  <GameCanvas onGameStateChange={handleGameStateChange} />
                </div>

                {/* BYTECLUB: HUD Panel - Right 30% */}
                <ByteRushHUD
                  gameState={gameState}
                  leaderboard={leaderboard}
                  onPause={handlePause}
                  onResume={handleResume}
                  onRestart={handleRestart}
                  onExit={handleExit}
                  isConnected={isConnected}
                  connectedUsers={connectedUsers}
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
                  <div className="text-2xl font-bold text-white">{connectedUsers}</div>
                  <div className="text-gray-400">Players Online</div>
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
