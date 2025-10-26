import { useState, useCallback, useRef, useEffect } from 'react';

// BYTECLUB: Byte Rush Game Interfaces
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  score: number;
  lives: number;
  wave: number;
  enemiesKilled: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  width: number;
  height: number;
  speed: number;
}

export interface Bullet {
  position: Position;
  width: number;
  height: number;
  speed: number;
}

export interface Enemy {
  position: Position;
  width: number;
  height: number;
  speed: number;
  type: 'normal' | 'fast' | 'tank' | 'zigzag';
  health: number;
}

export interface PowerUp {
  position: Position;
  type: 'health' | 'rapid' | 'shield';
  collected: boolean;
}

export interface Particle {
  position: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  color: string;
}

// BYTECLUB: Game Configuration
export const GAME_CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  PLAYER_SPEED: 8,
  BULLET_SPEED: 12,
  ENEMY_SPAWN_RATE: 60,
  POWER_UP_SPAWN_RATE: 300,
  WAVE_INCREASE: 5,
  POINTS_NORMAL: 10,
  POINTS_FAST: 20,
  POINTS_TANK: 50,
  POINTS_ZIGZAG: 30,
  // Progressive difficulty
  DIFFICULTY_MULTIPLIER: 1.15, // 15% harder per wave
  MAX_SPEED_MULTIPLIER: 3.0
};

export function useByteRushGame() {
  // BYTECLUB: Game State
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    score: 0,
    lives: 3,
    wave: 1,
    enemiesKilled: 0
  });

  // BYTECLUB: Game Entities
  const [player, setPlayer] = useState<Player>({
    position: { x: GAME_CONFIG.CANVAS_WIDTH / 2 - 30, y: GAME_CONFIG.CANVAS_HEIGHT - 100 },
    width: 60,
    height: 60,
    speed: GAME_CONFIG.PLAYER_SPEED
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const playerRef = useRef<Player>(player);

  // BYTECLUB: Keyboard State
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);
  const lastShotTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // BYTECLUB: Shooting Mechanics
  const handleShoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < 150) return; // Rapid fire rate

    lastShotTimeRef.current = now;
    
    // BYTECLUB: Use current player position from ref
    const currentPlayer = playerRef.current;
    const newBullet: Bullet = {
      position: {
        x: currentPlayer.position.x + currentPlayer.width / 2 - 5,
        y: currentPlayer.position.y
      },
      width: 10,
      height: 20,
      speed: GAME_CONFIG.BULLET_SPEED
    };

    bulletsRef.current.push(newBullet);
  }, []);

  // BYTECLUB: Handle Keyboard Input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // BYTECLUB: Prevent spacebar from scrolling page
    if (event.key === ' ') {
      event.preventDefault();
    }
    
    keysRef.current[event.key.toLowerCase()] = true;
    
    if (event.key === ' ' && gameState.isPlaying && !gameState.isPaused) {
      handleShoot();
    }
  }, [gameState.isPlaying, gameState.isPaused, handleShoot]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysRef.current[event.key.toLowerCase()] = false;
  }, []);

  // BYTECLUB: Player Movement
  const updatePlayer = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const keys = keysRef.current;
    const currentPlayer = playerRef.current;
    const newPosition = { ...currentPlayer.position };

    if (keys['a'] || keys['arrowleft']) {
      newPosition.x = Math.max(0, newPosition.x - currentPlayer.speed);
    }
    if (keys['d'] || keys['arrowright']) {
      newPosition.x = Math.min(GAME_CONFIG.CANVAS_WIDTH - currentPlayer.width, newPosition.x + currentPlayer.speed);
    }

    const updatedPlayer = { ...currentPlayer, position: newPosition };
    playerRef.current = updatedPlayer;
    setPlayer(updatedPlayer);
  }, [gameState.isPlaying, gameState.isPaused]);

  // BYTECLUB: Update Bullets
  const updateBullets = useCallback(() => {
    bulletsRef.current = bulletsRef.current
      .map(bullet => ({
        ...bullet,
        position: { ...bullet.position, y: bullet.position.y - bullet.speed }
      }))
      .filter(bullet => bullet.position.y > -bullet.height);
  }, []);

  // BYTECLUB: Spawn Enemies with progressive difficulty
  const spawnEnemy = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const enemyTypes: Enemy['type'][] = ['normal', 'fast', 'tank', 'zigzag'];
    
    // Progressive difficulty: more difficult enemies appear later
    let randomType: Enemy['type'];
    if (gameState.wave <= 3) {
      randomType = Math.random() < 0.7 ? 'normal' : 'fast';
    } else if (gameState.wave <= 6) {
      const rand = Math.random();
      if (rand < 0.4) randomType = 'normal';
      else if (rand < 0.7) randomType = 'fast';
      else randomType = 'zigzag';
    } else {
      randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    }
    
    // Progressive difficulty scaling
    const difficultyMultiplier = Math.min(
      Math.pow(GAME_CONFIG.DIFFICULTY_MULTIPLIER, gameState.wave - 1),
      GAME_CONFIG.MAX_SPEED_MULTIPLIER
    );
    
    const baseSpeeds = {
      normal: 2,
      fast: 4,
      tank: 1,
      zigzag: 2.5
    };
    
    const speeds = {
      normal: baseSpeeds.normal * difficultyMultiplier,
      fast: baseSpeeds.fast * difficultyMultiplier,
      tank: baseSpeeds.tank * difficultyMultiplier,
      zigzag: baseSpeeds.zigzag * difficultyMultiplier
    };

    const healthMap = {
      normal: 1,
      fast: 1,
      tank: Math.min(3 + Math.floor(gameState.wave / 3), 10),
      zigzag: 2
    };

    const enemy: Enemy = {
      position: {
        x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - 60),
        y: -60
      },
      width: 60,
      height: 60,
      speed: speeds[randomType],
      type: randomType,
      health: healthMap[randomType]
    };

    enemiesRef.current.push(enemy);
  }, [gameState.isPlaying, gameState.isPaused, gameState.wave]);

  // BYTECLUB: Update Enemies
  const updateEnemies = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    enemiesRef.current = enemiesRef.current.map(enemy => {
      let newY = enemy.position.y + enemy.speed;

      // BYTECLUB: Zigzag movement
      if (enemy.type === 'zigzag') {
        newY = enemy.position.y + enemy.speed;
        enemy.position.x += Math.sin(enemy.position.y * 0.1) * 2;
        enemy.position.x = Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - enemy.width, enemy.position.x));
      }

      return {
        ...enemy,
        position: { ...enemy.position, y: newY }
      };
    }).filter(enemy => enemy.position.y < GAME_CONFIG.CANVAS_HEIGHT + 100);
  }, [gameState.isPlaying, gameState.isPaused]);

  // BYTECLUB: Check Collisions
  const checkCollisions = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // BYTECLUB: Bullet vs Enemy collisions
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      let hit = false;
      
      enemiesRef.current = enemiesRef.current.map(enemy => {
        if (!hit && 
            bullet.position.x < enemy.position.x + enemy.width &&
            bullet.position.x + bullet.width > enemy.position.x &&
            bullet.position.y < enemy.position.y + enemy.height &&
            bullet.position.y + bullet.height > enemy.position.y
        ) {
          hit = true;
          
          // BYTECLUB: Create explosion particles
          for (let i = 0; i < 10; i++) {
            particlesRef.current.push({
              position: { ...enemy.position },
              velocity: {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
              },
              life: 30,
              maxLife: 30,
              color: enemy.type === 'tank' ? '#ff6b6b' : '#4ecdc4'
            });
          }

          enemy.health -= 1;
          
          if (enemy.health <= 0) {
            // BYTECLUB: Award points based on enemy type
            const points = {
              normal: GAME_CONFIG.POINTS_NORMAL,
              fast: GAME_CONFIG.POINTS_FAST,
              tank: GAME_CONFIG.POINTS_TANK,
              zigzag: GAME_CONFIG.POINTS_ZIGZAG
            };
            
            setGameState(prev => ({
              ...prev,
              score: prev.score + points[enemy.type] * prev.wave,
              enemiesKilled: prev.enemiesKilled + 1
            }));

            return null; // Remove enemy
          }
        }
        return enemy;
      }).filter(enemy => enemy !== null) as Enemy[];

      return !hit;
    });

    // BYTECLUB: Enemy vs Player collisions - ANY TOUCH = GAME OVER
    const currentPlayer = playerRef.current;
    enemiesRef.current.forEach(enemy => {
      if (
        enemy.position.x < currentPlayer.position.x + currentPlayer.width &&
        enemy.position.x + enemy.width > currentPlayer.position.x &&
        enemy.position.y < currentPlayer.position.y + currentPlayer.height &&
        enemy.position.y + enemy.height > currentPlayer.position.y
      ) {
        // BYTECLUB: Game Over immediately on any contact
        setGameState(prev => ({
          ...prev,
          isPlaying: false,
          gameOver: true,
          lives: 0
        }));

        // BYTECLUB: Remove enemy and create massive explosion
        enemiesRef.current = enemiesRef.current.filter(e => e !== enemy);
        
        // BYTECLUB: Create big explosion effect
        for (let i = 0; i < 30; i++) {
          particlesRef.current.push({
            position: { ...currentPlayer.position },
            velocity: {
              x: (Math.random() - 0.5) * 12,
              y: (Math.random() - 0.5) * 12
            },
            life: 60,
            maxLife: 60,
            color: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#ff6600' : '#ffff00'
          });
        }
      }
    });

    // BYTECLUB: Power-up collection
    powerUpsRef.current = powerUpsRef.current.map(powerUp => {
      if (!powerUp.collected &&
          powerUp.position.x < currentPlayer.position.x + currentPlayer.width &&
          powerUp.position.x + 30 > currentPlayer.position.x &&
          powerUp.position.y < currentPlayer.position.y + currentPlayer.height &&
          powerUp.position.y + 30 > currentPlayer.position.y
      ) {
        // BYTECLUB: Activate power-up
        if (powerUp.type === 'health') {
          setGameState(prev => ({ ...prev, lives: Math.min(prev.lives + 1, 5) }));
        }
        
        return { ...powerUp, collected: true };
      }
      return powerUp;
    }).filter(powerUp => !powerUp.collected && powerUp.position.y < GAME_CONFIG.CANVAS_HEIGHT);

    // BYTECLUB: Update particles
    particlesRef.current = particlesRef.current
      .map(particle => ({
        ...particle,
        position: {
          x: particle.position.x + particle.velocity.x,
          y: particle.position.y + particle.velocity.y
        },
        life:         particle.life - 1
      }))
      .filter(particle => particle.life > 0);
  }, [gameState.isPlaying, gameState.isPaused, gameState.wave]);

  // BYTECLUB: Spawn Power-ups
  const spawnPowerUp = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    if (Math.random() > 0.3) return; // 30% chance

    const types: PowerUp['type'][] = ['health', 'rapid', 'shield'];
    const powerUp: PowerUp = {
      position: {
        x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - 30),
        y: -30
      },
      type: types[Math.floor(Math.random() * types.length)],
      collected: false
    };

    powerUpsRef.current.push(powerUp);
  }, [gameState.isPlaying, gameState.isPaused]);

  // BYTECLUB: Update Power-ups
  const updatePowerUps = useCallback(() => {
    powerUpsRef.current = powerUpsRef.current.map(powerUp => ({
      ...powerUp,
      position: { ...powerUp.position, y: powerUp.position.y + 3 }
    }));
  }, []);

  // BYTECLUB: Update Wave
  const updateWave = useCallback(() => {
    if (gameState.enemiesKilled > 0 && gameState.enemiesKilled % GAME_CONFIG.WAVE_INCREASE === 0) {
      setGameState(prev => ({ ...prev, wave: prev.wave + 1 }));
    }
  }, [gameState.enemiesKilled]);

  // BYTECLUB: Main Game Loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    frameCountRef.current += 1;

    updatePlayer();
    updateBullets();
    updateEnemies();
    updatePowerUps();
    checkCollisions();
    updateWave();

    // BYTECLUB: Spawn enemies periodically - faster as waves increase
    const spawnRate = Math.max(
      20, 
      GAME_CONFIG.ENEMY_SPAWN_RATE - Math.floor(gameState.wave / 2) * 5
    );
    if (frameCountRef.current % spawnRate === 0) {
      // BYTECLUB: Spawn multiple enemies in later waves
      const spawnCount = Math.floor(gameState.wave / 5) + 1;
      for (let i = 0; i < Math.min(spawnCount, 3); i++) {
        spawnEnemy();
      }
    }

    // BYTECLUB: Spawn power-ups
    if (frameCountRef.current % GAME_CONFIG.POWER_UP_SPAWN_RATE === 0) {
      spawnPowerUp();
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updatePlayer, updateBullets, updateEnemies, updatePowerUps, checkCollisions, updateWave, spawnEnemy, spawnPowerUp]);

  // BYTECLUB: Start Game
  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      score: 0,
      lives: 3,
      wave: 1,
      enemiesKilled: 0
    });

    setPlayer({
      position: { x: GAME_CONFIG.CANVAS_WIDTH / 2 - 30, y: GAME_CONFIG.CANVAS_HEIGHT - 100 },
      width: 60,
      height: 60,
      speed: GAME_CONFIG.PLAYER_SPEED
    });

    bulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    frameCountRef.current = 0;

    gameLoop();
  }, [gameLoop]);

  // BYTECLUB: Pause Game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // BYTECLUB: Resume Game
  const resumeGame = useCallback(() => {
    if (gameState.isPlaying && gameState.isPaused) {
      setGameState(prev => ({ ...prev, isPaused: false }));
      gameLoop();
    }
  }, [gameState, gameLoop]);

  // BYTECLUB: Update playerRef when player state changes
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // BYTECLUB: Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  // BYTECLUB: Resume game loop when unpaused
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.gameOver) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, gameLoop]);

  return {
    gameState,
    player,
    bullets: bulletsRef.current,
    enemies: enemiesRef.current,
    powerUps: powerUpsRef.current,
    particles: particlesRef.current,
    startGame,
    pauseGame,
    resumeGame,
    GAME_CONFIG
  };
}
