import { useState, useCallback, useRef } from 'react';

// BYTECLUB: Game state interface for brick-breaker
export interface GameState {
  score: number;
  lives: number;
  level: number;
  bricksBroken: number;
  combos: number;
  isRunning: boolean;
  isPaused: boolean;
  gameSpeed: number;
  activePowerups: string[];
  powerupTimers: { [key: string]: number };
}

// BYTECLUB: Game objects interfaces
export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  broken: boolean;
  powerup?: string;
}

export interface Powerup {
  x: number;
  y: number;
  type: string;
  dy: number;
  collected: boolean;
}

// BYTECLUB: Game configuration
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 15,
  PADDLE_SPEED: 8,
  BALL_RADIUS: 8,
  BALL_SPEED: 5,
  BRICK_ROWS: 8,
  BRICKS_PER_ROW: 10,
  BRICK_WIDTH: 70,
  BRICK_HEIGHT: 25,
  BRICK_PADDING: 5,
  POWERUP_SPAWN_RATE: 0.1,
  POWERUP_FALL_SPEED: 2,
  LIVES: 3,
  SCORE_MULTIPLIER: {
    BRICK: 50,
    POWERUP: 25,
    COMBO: 100
  }
};

// BYTECLUB: Colors for ByteClub theme
const COLORS = {
  BACKGROUND: '#0a0e14',
  PADDLE: '#00fff9', // Neon cyan
  BALL: '#ff3bcf', // Magenta
  BRICKS: ['#a020f0', '#ff3bcf', '#00fff9', '#7fff00'], // Purple, Magenta, Cyan, Lime
  POWERUPS: {
    tryCatch: '#00fff9',
    garbageCollector: '#7fff00',
    debuggerDrone: '#ff3bcf',
    optimizationBoost: '#a020f0'
  },
  TEXT: '#ffffff',
  NEON_GLOW: 'rgba(0, 255, 249, 0.3)'
};

// BYTECLUB: Game engine hook for brick-breaker
export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: GAME_CONFIG.LIVES,
    level: 1,
    bricksBroken: 0,
    combos: 0,
    isRunning: false,
    isPaused: false,
    gameSpeed: 1,
    activePowerups: [],
    powerupTimers: {}
  });

  const [ball, setBall] = useState<Ball>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT - 50,
    dx: GAME_CONFIG.BALL_SPEED,
    dy: -GAME_CONFIG.BALL_SPEED,
    radius: GAME_CONFIG.BALL_RADIUS,
    speed: GAME_CONFIG.BALL_SPEED
  });

  const [paddle, setPaddle] = useState<Paddle>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT - 30,
    width: GAME_CONFIG.PADDLE_WIDTH,
    height: GAME_CONFIG.PADDLE_HEIGHT,
    speed: GAME_CONFIG.PADDLE_SPEED
  });

  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [particles, setParticles] = useState<any[]>([]);

  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // BYTECLUB: Initialize game
  const initializeGame = useCallback(() => {
    // Create bricks
    const newBricks: Brick[] = [];
    for (let row = 0; row < GAME_CONFIG.BRICK_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.BRICKS_PER_ROW; col++) {
        const x = col * (GAME_CONFIG.BRICK_WIDTH + GAME_CONFIG.BRICK_PADDING) + 50;
        const y = row * (GAME_CONFIG.BRICK_HEIGHT + GAME_CONFIG.BRICK_PADDING) + 50;
        
        newBricks.push({
          x,
          y,
          width: GAME_CONFIG.BRICK_WIDTH,
          height: GAME_CONFIG.BRICK_HEIGHT,
          color: COLORS.BRICKS[row % COLORS.BRICKS.length],
          broken: false,
          powerup: Math.random() < GAME_CONFIG.POWERUP_SPAWN_RATE ? 
            ['tryCatch', 'garbageCollector', 'debuggerDrone', 'optimizationBoost'][Math.floor(Math.random() * 4)] : 
            undefined
        });
      }
    }

    setBricks(newBricks);
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: GAME_CONFIG.LIVES,
      level: 1,
      bricksBroken: 0,
      combos: 0,
      isRunning: true,
      isPaused: false,
      activePowerups: [],
      powerupTimers: {}
    }));

    setBall({
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT - 50,
      dx: GAME_CONFIG.BALL_SPEED,
      dy: -GAME_CONFIG.BALL_SPEED,
      radius: GAME_CONFIG.BALL_RADIUS,
      speed: GAME_CONFIG.BALL_SPEED
    });

    setPaddle({
      x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT - 30,
      width: GAME_CONFIG.PADDLE_WIDTH,
      height: GAME_CONFIG.PADDLE_HEIGHT,
      speed: GAME_CONFIG.PADDLE_SPEED
    });

    setPowerups([]);
    setParticles([]);
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

  // BYTECLUB: Update paddle position
  const updatePaddle = useCallback(() => {
    setPaddle(prev => {
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

  // BYTECLUB: Update ball position and collisions
  const updateBall = useCallback(() => {
    setBall(prev => {
      let newBall = { ...prev };
      
      // Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;
      
      // Wall collisions
      if (newBall.x - newBall.radius <= 0 || newBall.x + newBall.radius >= GAME_CONFIG.CANVAS_WIDTH) {
        newBall.dx = -newBall.dx;
      }
      if (newBall.y - newBall.radius <= 0) {
        newBall.dy = -newBall.dy;
      }
      
      // Paddle collision
      if (newBall.y + newBall.radius >= paddle.y &&
          newBall.x >= paddle.x &&
          newBall.x <= paddle.x + paddle.width) {
        
        // BYTECLUB: Calculate bounce angle based on where ball hits paddle
        const hitPos = (newBall.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // -60 to 60 degrees
        
        newBall.dx = Math.sin(angle) * newBall.speed;
        newBall.dy = -Math.abs(Math.cos(angle) * newBall.speed);
        
        // BYTECLUB: Add some randomness to prevent boring patterns
        newBall.dx += (Math.random() - 0.5) * 0.5;
      }
      
      // BYTECLUB: Check if ball fell below paddle
      if (newBall.y > GAME_CONFIG.CANVAS_HEIGHT) {
        setGameState(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            return { ...prev, lives: 0, isRunning: false };
          }
          return { ...prev, lives: newLives };
        });
        
        // Reset ball position
        newBall.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        newBall.y = GAME_CONFIG.CANVAS_HEIGHT - 50;
        newBall.dx = GAME_CONFIG.BALL_SPEED;
        newBall.dy = -GAME_CONFIG.BALL_SPEED;
      }
      
      return newBall;
    });
  }, [paddle]);

  // BYTECLUB: Check brick collisions
  const checkBrickCollisions = useCallback(() => {
    setBricks(prevBricks => {
      const newBricks = [...prevBricks];
      let bricksBrokenThisFrame = 0;
      
      newBricks.forEach((brick, index) => {
        if (brick.broken) return;
        
        // BYTECLUB: Check collision with ball
        if (ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {
          
          // BYTECLUB: Break brick
          newBricks[index] = { ...brick, broken: true };
          bricksBrokenThisFrame++;
          
          // BYTECLUB: Spawn powerup if brick had one
          if (brick.powerup) {
            setPowerups(prev => [...prev, {
              x: brick.x + brick.width / 2,
              y: brick.y + brick.height / 2,
              type: brick.powerup!,
              dy: GAME_CONFIG.POWERUP_FALL_SPEED,
              collected: false
            }]);
          }
          
          // BYTECLUB: Create particles
          setParticles(prev => [...prev, ...createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color)]);
          
          // BYTECLUB: Bounce ball
          setBall(prev => {
            const newBall = { ...prev };
            
            // BYTECLUB: Determine bounce direction
            const ballCenterX = newBall.x;
            const ballCenterY = newBall.y;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            
            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
              newBall.dx = -newBall.dx;
            } else {
              newBall.dy = -newBall.dy;
            }
            
            return newBall;
          });
        }
      });
      
      // BYTECLUB: Update score and combos
      if (bricksBrokenThisFrame > 0) {
        setGameState(prev => {
          const newScore = prev.score + (bricksBrokenThisFrame * GAME_CONFIG.SCORE_MULTIPLIER.BRICK);
          const newBricksBroken = prev.bricksBroken + bricksBrokenThisFrame;
          const newCombos = prev.combos + bricksBrokenThisFrame;
          
          return {
            ...prev,
            score: newScore,
            bricksBroken: newBricksBroken,
            combos: newCombos
          };
        });
      }
      
      return newBricks;
    });
  }, [ball]);

  // BYTECLUB: Create particles for visual effects
  const createParticles = useCallback((x: number, y: number, color: string) => {
    const particleCount = 8;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color
      });
    }
    
    return newParticles;
  }, []);

  // BYTECLUB: Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.dx,
        y: particle.y + particle.dy,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );
  }, []);

  // BYTECLUB: Update powerups
  const updatePowerups = useCallback(() => {
    setPowerups(prev => {
      const newPowerups = prev.map(powerup => ({
        ...powerup,
        y: powerup.y + powerup.dy
      })).filter(powerup => powerup.y < GAME_CONFIG.CANVAS_HEIGHT && !powerup.collected);
      
      // BYTECLUB: Check powerup collisions with paddle
      newPowerups.forEach((powerup, index) => {
        if (powerup.x >= paddle.x &&
            powerup.x <= paddle.x + paddle.width &&
            powerup.y >= paddle.y &&
            powerup.y <= paddle.y + paddle.height) {
          
          // BYTECLUB: Collect powerup
          newPowerups[index] = { ...powerup, collected: true };
          
          // BYTECLUB: Activate powerup
          setGameState(prev => {
            const newActivePowerups = [...prev.activePowerups, powerup.type];
            const newPowerupTimers = { ...prev.powerupTimers };
            
            // BYTECLUB: Set timer based on powerup type
            switch (powerup.type) {
              case 'tryCatch':
                newPowerupTimers[powerup.type] = 3000; // 3 seconds
                break;
              case 'debuggerDrone':
                newPowerupTimers[powerup.type] = 3000; // 3 seconds
                break;
              case 'optimizationBoost':
                newPowerupTimers[powerup.type] = 5000; // 5 seconds
                break;
              case 'garbageCollector':
                // BYTECLUB: Instant effect - clear 1-2 rows
                setBricks(prevBricks => {
                  const newBricks = [...prevBricks];
                  let clearedCount = 0;
                  
                  // BYTECLUB: Clear bottom 2 rows
                  for (let i = newBricks.length - 1; i >= 0 && clearedCount < 20; i--) {
                    if (!newBricks[i].broken) {
                      newBricks[i] = { ...newBricks[i], broken: true };
                      clearedCount++;
                    }
                  }
                  
                  return newBricks;
                });
                break;
            }
            
            return {
              ...prev,
              activePowerups: newActivePowerups,
              powerupTimers: newPowerupTimers,
              score: prev.score + GAME_CONFIG.SCORE_MULTIPLIER.POWERUP
            };
          });
        }
      });
      
      return newPowerups;
    });
  }, [paddle]);

  // BYTECLUB: Update powerup timers
  const updatePowerupTimers = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newPowerupTimers = { ...prev.powerupTimers };
      const newActivePowerups = [...prev.activePowerups];
      
      Object.keys(newPowerupTimers).forEach(powerupType => {
        newPowerupTimers[powerupType] -= deltaTime;
        
        if (newPowerupTimers[powerupType] <= 0) {
          delete newPowerupTimers[powerupType];
          const index = newActivePowerups.indexOf(powerupType);
          if (index > -1) {
            newActivePowerups.splice(index, 1);
          }
        }
      });
      
      return {
        ...prev,
        activePowerups: newActivePowerups,
        powerupTimers: newPowerupTimers
      };
    });
  }, []);

  // BYTECLUB: Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isRunning || gameState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // BYTECLUB: Update game objects
    updatePaddle();
    updateBall();
    checkBrickCollisions();
    updateParticles();
    updatePowerups();
    updatePowerupTimers(deltaTime);

    // BYTECLUB: Check win condition
    const remainingBricks = bricks.filter(brick => !brick.broken).length;
    if (remainingBricks === 0) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1,
        isRunning: false
      }));
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, gameState.isPaused, updatePaddle, updateBall, checkBrickCollisions, updateParticles, updatePowerups, updatePowerupTimers, bricks]);

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
    ball,
    paddle,
    bricks,
    powerups,
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
