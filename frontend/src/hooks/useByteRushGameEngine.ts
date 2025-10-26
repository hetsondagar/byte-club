import { useState, useCallback, useRef, useEffect } from 'react';

// BYTECLUB: Game state interface for Byte Rush falling blocks
export interface ByteRushGameState {
  score: number;
  lives: number;
  level: number;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  blockSpawnRate: number;
  gameTime: number;
  multiplier: number;
  consecutiveGood: number;
}

// BYTECLUB: Block types
export type BlockType = 'good' | 'bad' | 'powerup';

// BYTECLUB: Block interface
export interface ByteRushBlock {
  id: string;
  x: number;
  y: number;
  size: number;
  type: BlockType;
  speed: number;
  powerupType?: 'speedBoost' | 'shield' | 'scoreMultiplier';
}

// BYTECLUB: Player interface
export interface ByteRushPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  shieldActive: boolean;
  speedBoostActive: boolean;
  scoreMultiplier: number;
}

// BYTECLUB: Particle effect
export interface ByteRushParticle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
}

// BYTECLUB: Game configuration
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_WIDTH: 60,
  PLAYER_HEIGHT: 60,
  PLAYER_SPEED: 8,
  PLAYER_Y: 520, // Position at bottom
  BLOCK_SIZE: 40,
  BLOCK_SPEED_INITIAL: 2,
  BLOCK_SPEED_INCREMENT: 0.5,
  BLOCK_SPAWN_RATE_INITIAL: 60, // Frames between spawns
  BLOCK_SPAWN_RATE_MIN: 20,
  BLOCK_SPAWN_RATE_DECREMENT: 2,
  SPEED_INCREMENT_INTERVAL: 1800, // 30 seconds at 60 FPS
  LIVES: 3,
  POINTS_GOOD_BLOCK: 10,
  POINTS_POWERUP: 50,
  POWERUP_SPAWN_CHANCE: 0.15, // 15% chance
  SHIELD_DURATION: 300, // frames (5 seconds at 60 FPS)
  SPEEDBOOST_DURATION: 180, // frames (3 seconds at 60 FPS)
  MULTIPLIER_DURATION: 300, // frames (5 seconds at 60 FPS)
  MULTIPLIER_ACTIVATION: 5 // Consecutive good blocks to activate
};

// BYTECLUB: Colors for ByteClub theme
const COLORS = {
  BACKGROUND: '#0a0e14',
  PLAYER: '#00fff9', // Neon cyan
  BLOCK_GOOD: '#00ff00', // Green
  BLOCK_BAD: '#ff0000', // Red
  BLOCK_POWERUP: '#0080ff', // Blue
  POWERUP_SPEEDBOOST: '#ffff00', // Yellow
  POWERUP_SHIELD: '#8000ff', // Purple
  POWERUP_MULTIPLIER: '#ff8000', // Orange
  TEXT: '#ffffff',
  NEON_GLOW: 'rgba(0, 255, 249, 0.3)'
};

// BYTECLUB: Game engine hook for Byte Rush
export function useByteRushGameEngine() {
  const [gameState, setGameState] = useState<ByteRushGameState>({
    score: 0,
    lives: GAME_CONFIG.LIVES,
    level: 1,
    isRunning: false,
    isPaused: false,
    speed: GAME_CONFIG.BLOCK_SPEED_INITIAL,
    blockSpawnRate: GAME_CONFIG.BLOCK_SPAWN_RATE_INITIAL,
    gameTime: 0,
    multiplier: 1,
    consecutiveGood: 0
  });

  const [player, setPlayer] = useState<ByteRushPlayer>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER_WIDTH / 2,
    y: GAME_CONFIG.PLAYER_Y,
    width: GAME_CONFIG.PLAYER_WIDTH,
    height: GAME_CONFIG.PLAYER_HEIGHT,
    speed: GAME_CONFIG.PLAYER_SPEED,
    shieldActive: false,
    speedBoostActive: false,
    scoreMultiplier: 1
  });

  const [blocks, setBlocks] = useState<ByteRushBlock[]>([]);
  const [particles, setParticles] = useState<ByteRushParticle[]>([]);
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const blockSpawnCounterRef = useRef<number>(0);
  const powerupTimersRef = useRef<{ [key: string]: number }>({});
  const blockIdCounterRef = useRef<number>(0);
  const particleIdCounterRef = useRef<number>(0);

  // BYTECLUB: Generate random block type
  const generateBlockType = useCallback((): BlockType => {
    const rand = Math.random();
    if (rand < 0.1) return 'bad'; // 10% bad blocks
    if (rand < 0.25) return 'powerup'; // 15% powerups
    return 'good'; // 75% good blocks
  }, []);

  // BYTECLUB: Generate powerup type
  const generatePowerupType = useCallback((): 'speedBoost' | 'shield' | 'scoreMultiplier' => {
    const types: Array<'speedBoost' | 'shield' | 'scoreMultiplier'> = 
      ['speedBoost', 'shield', 'scoreMultiplier'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  // BYTECLUB: Initialize game
  const initializeGame = useCallback(() => {
    console.log('🎮 ByteRushGame: Initializing game...');
    setGameState({
      score: 0,
      lives: GAME_CONFIG.LIVES,
      level: 1,
      isRunning: true,
      isPaused: false,
      speed: GAME_CONFIG.BLOCK_SPEED_INITIAL,
      blockSpawnRate: GAME_CONFIG.BLOCK_SPAWN_RATE_INITIAL,
      gameTime: 0,
      multiplier: 1,
      consecutiveGood: 0
    });

    setPlayer({
      x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER_WIDTH / 2,
      y: GAME_CONFIG.PLAYER_Y,
      width: GAME_CONFIG.PLAYER_WIDTH,
      height: GAME_CONFIG.PLAYER_HEIGHT,
      speed: GAME_CONFIG.PLAYER_SPEED,
      shieldActive: false,
      speedBoostActive: false,
      scoreMultiplier: 1
    });

    setBlocks([]);
    setParticles([]);
    blockSpawnCounterRef.current = 0;
    blockIdCounterRef.current = 0;
    particleIdCounterRef.current = 0;
    powerupTimersRef.current = {};
    
    console.log('🎮 ByteRushGame: Game initialized');
  }, []);

  // BYTECLUB: Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysRef.current[event.code] = true;
    
    if (event.code === 'KeyP') {
      event.preventDefault();
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysRef.current[event.code] = false;
  }, []);

  // BYTECLUB: Update player position
  const updatePlayer = useCallback(() => {
    setPlayer(prev => {
      let newX = prev.x;
      
      if (keysRef.current['ArrowLeft'] && newX > 0) {
        newX -= prev.speed;
      }
      if (keysRef.current['ArrowRight'] && newX < GAME_CONFIG.CANVAS_WIDTH - prev.width) {
        newX += prev.speed;
      }
      
      return { ...prev, x: newX };
    });
  }, []);

  // BYTECLUB: Create particle effect
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const newParticles: ByteRushParticle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${particleIdCounterRef.current++}`,
        x,
        y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // BYTECLUB: Update blocks
  const updateBlocks = useCallback(() => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks
        .map(block => ({
          ...block,
          y: block.y + block.speed
        }))
        .filter(block => block.y < GAME_CONFIG.CANVAS_HEIGHT);

      // Check collisions with player
      newBlocks.forEach((block, index) => {
        const blockCenterX = block.x + block.size / 2;
        const blockCenterY = block.y + block.size / 2;
        
        if (
          blockCenterX >= player.x &&
          blockCenterX <= player.x + player.width &&
          blockCenterY >= player.y &&
          blockCenterY <= player.y + player.height
        ) {
          // Collision detected
          if (block.type === 'good') {
            // Good block: add score
            setGameState(prev => {
              const newConsecutive = prev.consecutiveGood + 1;
              const newMultiplier = newConsecutive >= GAME_CONFIG.MULTIPLIER_ACTIVATION ? 2 : 1;
              const points = GAME_CONFIG.POINTS_GOOD_BLOCK * newMultiplier;
              return {
                ...prev,
                score: prev.score + points,
                consecutiveGood: newConsecutive,
                multiplier: newMultiplier
              };
            });
            
            // Create green particle effect
            createParticles(blockCenterX, blockCenterY, COLORS.BLOCK_GOOD);
            
            // Remove block
            newBlocks.splice(index, 1);
          } else if (block.type === 'bad') {
            // Bad block: check if shield is active
            if (player.shieldActive) {
              // Shield protects player
              createParticles(blockCenterX, blockCenterY, COLORS.POWERUP_SHIELD);
              newBlocks.splice(index, 1);
            } else {
              // Lose a life
              setGameState(prev => {
                const newLives = prev.lives - 1;
                if (newLives <= 0) {
                  return { ...prev, lives: 0, isRunning: false };
                }
                return { ...prev, lives: newLives, consecutiveGood: 0, multiplier: 1 };
              });
              
              // Create red particle effect
              createParticles(blockCenterX, blockCenterY, COLORS.BLOCK_BAD);
              
              // Remove block
              newBlocks.splice(index, 1);
            }
          } else if (block.type === 'powerup') {
            // Powerup block: activate powerup
            const powerupType = block.powerupType || generatePowerupType();
            
            setPlayer(prev => {
              const newPlayer = { ...prev };
              
              switch (powerupType) {
                case 'shield':
                  newPlayer.shieldActive = true;
                  powerupTimersRef.current.shield = GAME_CONFIG.SHIELD_DURATION;
                  break;
                case 'speedBoost':
                  newPlayer.speedBoostActive = true;
                  newPlayer.speed = GAME_CONFIG.PLAYER_SPEED * 1.5;
                  powerupTimersRef.current.speedBoost = GAME_CONFIG.SPEEDBOOST_DURATION;
                  break;
                case 'scoreMultiplier':
                  newPlayer.scoreMultiplier = 2;
                  powerupTimersRef.current.scoreMultiplier = GAME_CONFIG.MULTIPLIER_DURATION;
                  break;
              }
              
              return newPlayer;
            });
            
            setGameState(prev => ({
              ...prev,
              score: prev.score + GAME_CONFIG.POINTS_POWERUP
            }));
            
            // Create blue particle effect
            createParticles(blockCenterX, blockCenterY, COLORS.BLOCK_POWERUP);
            
            // Remove block
            newBlocks.splice(index, 1);
          }
        }
      });

      return newBlocks;
    });
  }, [player, createParticles, generatePowerupType]);

  // BYTECLUB: Spawn blocks
  const spawnBlocks = useCallback(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      blockSpawnCounterRef.current++;
      
      if (blockSpawnCounterRef.current >= gameState.blockSpawnRate) {
        const blockType = generateBlockType();
        const newBlock: ByteRushBlock = {
          id: `block-${blockIdCounterRef.current++}`,
          x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.BLOCK_SIZE),
          y: -GAME_CONFIG.BLOCK_SIZE,
          size: GAME_CONFIG.BLOCK_SIZE,
          type: blockType,
          speed: gameState.speed,
          powerupType: blockType === 'powerup' ? generatePowerupType() : undefined
        };
        
        setBlocks(prev => [...prev, newBlock]);
        blockSpawnCounterRef.current = 0;
      }
    }
  }, [gameState, generateBlockType, generatePowerupType]);

  // BYTECLUB: Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.dx,
          y: particle.y + particle.dy,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  // BYTECLUB: Update powerup timers
  const updatePowerupTimers = useCallback(() => {
    Object.keys(powerupTimersRef.current).forEach(powerupType => {
      powerupTimersRef.current[powerupType]--;
      
      if (powerupTimersRef.current[powerupType] <= 0) {
        delete powerupTimersRef.current[powerupType];
        
        setPlayer(prev => {
          const newPlayer = { ...prev };
          
          switch (powerupType) {
            case 'shield':
              newPlayer.shieldActive = false;
              break;
            case 'speedBoost':
              newPlayer.speedBoostActive = false;
              newPlayer.speed = GAME_CONFIG.PLAYER_SPEED;
              break;
            case 'scoreMultiplier':
              newPlayer.scoreMultiplier = 1;
              break;
          }
          
          return newPlayer;
        });
      }
    });
  }, []);

  // BYTECLUB: Increase difficulty over time
  const updateDifficulty = useCallback(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      setGameState(prev => {
        const newTime = prev.gameTime + 1;
        
        // Increase speed and spawn rate every 30 seconds
        if (newTime % GAME_CONFIG.SPEED_INCREMENT_INTERVAL === 0) {
          return {
            ...prev,
            speed: Math.min(prev.speed + GAME_CONFIG.BLOCK_SPEED_INCREMENT, 10),
            blockSpawnRate: Math.max(prev.blockSpawnRate - GAME_CONFIG.BLOCK_SPAWN_RATE_DECREMENT, GAME_CONFIG.BLOCK_SPAWN_RATE_MIN),
            level: prev.level + 1,
            gameTime: newTime
          };
        }
        
        return { ...prev, gameTime: newTime };
      });
    }
  }, [gameState.isRunning, gameState.isPaused]);

  // BYTECLUB: Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isRunning || gameState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update game objects
    updatePlayer();
    updateBlocks();
    updateParticles();
    updatePowerupTimers();
    spawnBlocks();
    updateDifficulty();

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, gameState.isPaused, updatePlayer, updateBlocks, updateParticles, updatePowerupTimers, spawnBlocks, updateDifficulty]);

  // BYTECLUB: Start game loop
  const startGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // BYTECLUB: Stop game loop
  const stopGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    gameState,
    player,
    blocks,
    particles,
    initializeGame,
    startGame,
    stopGame,
    handleKeyDown,
    handleKeyUp,
    GAME_CONFIG,
    COLORS
  };
}
