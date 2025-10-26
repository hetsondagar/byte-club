import { useState, useCallback, useRef } from 'react';

// BYTECLUB: Top-down shooter game state
export interface ByteRushGameState {
  score: number;
  lives: number;
  wave: number;
  isRunning: boolean;
  isPaused: boolean;
  gameTime: number;
}

// BYTECLUB: Player interface
export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  shieldActive: boolean;
  rapidFire: boolean;
}

// BYTECLUB: Bullet interface
export interface Bullet {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'player' | 'enemy';
}

// BYTECLUB: Enemy interface
export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  health: number;
  type: 'basic' | 'fast' | 'tank' | 'zigzag';
  points: number;
}

// BYTECLUB: Powerup interface
export interface Powerup {
  id: string;
  x: number;
  y: number;
  size: number;
  type: 'health' | 'shield' | 'rapidFire';
}

// BYTECLUB: Particle effect
export interface Particle {
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
  PLAYER_WIDTH: 40,
  PLAYER_HEIGHT: 40,
  PLAYER_SPEED: 5,
  PLAYER_START_X: 380,
  PLAYER_START_Y: 540,
  PLAYER_MAX_HEALTH: 3,
  BULLET_WIDTH: 4,
  BULLET_HEIGHT: 12,
  BULLET_SPEED: 8,
  ENEMY_BULLET_SPEED: 4,
  ENEMY_SPAWN_RATE: 120, // Frames between spawns
  ENEMY_SPAWN_RATE_MIN: 30,
  POWERUP_SPAWN_RATE: 600, // 10 seconds at 60 FPS
  SHIELD_DURATION: 600, // 10 seconds
  RAPIDFIRE_DURATION: 900, // 15 seconds
  RAPIDFIRE_SHOOT_INTERVAL: 10, // Frames between shots
  INITIAL_LIVES: 3
};

// BYTECLUB: Colors for ByteClub theme
const COLORS = {
  BACKGROUND: '#0a0e14',
  GRID: '#1a1f2e',
  PLAYER: '#00fff9', // Neon cyan
  BULLET_PLAYER: '#00ff00', // Green
  BULLET_ENEMY: '#ff0000', // Red
  ENEMY_BASIC: '#ff6b6b',
  ENEMY_FAST: '#4ecdc4',
  ENEMY_TANK: '#ffe66d',
  ENEMY_ZIGZAG: '#a29bfe',
  POWERUP_HEALTH: '#51cf66',
  POWERUP_SHIELD: '#845ef7',
  POWERUP_RAPIDFIRE: '#ffd43b',
  EXPLOSION: '#ff8787',
  TEXT: '#ffffff',
  NEON_GLOW: 'rgba(0, 255, 249, 0.3)'
};

// BYTECLUB: Top-down shooter game engine
export function useByteRushGameEngine() {
  const [gameState, setGameState] = useState<ByteRushGameState>({
    score: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    wave: 1,
    isRunning: false,
    isPaused: false,
    gameTime: 0
  });

  const [player, setPlayer] = useState<Player>({
    x: GAME_CONFIG.PLAYER_START_X,
    y: GAME_CONFIG.PLAYER_START_Y,
    width: GAME_CONFIG.PLAYER_WIDTH,
    height: GAME_CONFIG.PLAYER_HEIGHT,
    speed: GAME_CONFIG.PLAYER_SPEED,
    health: GAME_CONFIG.PLAYER_MAX_HEALTH,
    maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
    shieldActive: false,
    rapidFire: false
  });

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const enemySpawnTimerRef = useRef<number>(0);
  const powerupSpawnTimerRef = useRef<number>(0);
  const shootTimerRef = useRef<number>(0);
  const shieldTimerRef = useRef<number>(0);
  const rapidFireTimerRef = useRef<number>(0);
  const bulletIdCounterRef = useRef<number>(0);
  const enemyIdCounterRef = useRef<number>(0);
  const powerupIdCounterRef = useRef<number>(0);
  const particleIdCounterRef = useRef<number>(0);

  // BYTECLUB: Generate random enemy type
  const generateEnemyType = useCallback((): Enemy['type'] => {
    const rand = Math.random();
    const wave = gameState.wave;
    
    if (wave <= 1) return 'basic';
    if (wave <= 3) return rand < 0.7 ? 'basic' : 'fast';
    if (wave <= 5) return rand < 0.5 ? 'basic' : (rand < 0.8 ? 'fast' : 'zigzag');
    return rand < 0.3 ? 'basic' : (rand < 0.6 ? 'fast' : (rand < 0.85 ? 'zigzag' : 'tank'));
  }, [gameState.wave]);

  // BYTECLUB: Create enemy
  const createEnemy = useCallback((): Enemy => {
    const type = generateEnemyType();
    const configs = {
      basic: { health: 1, points: 10, speedX: 0, speedY: 1 },
      fast: { health: 1, points: 20, speedX: 0, speedY: 2 },
      tank: { health: 3, points: 50, speedX: 0, speedY: 0.5 },
      zigzag: { health: 1, points: 30, speedX: 1, speedY: 1.5 }
    };
    
    const config = configs[type];
    
    return {
      id: `enemy-${enemyIdCounterRef.current++}`,
      x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - 40),
      y: -40,
      width: type === 'tank' ? 50 : 40,
      height: type === 'tank' ? 50 : 40,
      speedX: config.speedX,
      speedY: config.speedY,
      health: config.health,
      type,
      points: config.points
    };
  }, [generateEnemyType]);

  // BYTECLUB: Initialize game
  const initializeGame = useCallback(() => {
    console.log('🎮 ByteRush: Initializing top-down shooter...');
    
    setGameState({
      score: 0,
      lives: GAME_CONFIG.INITIAL_LIVES,
      wave: 1,
      isRunning: true,
      isPaused: false,
      gameTime: 0
    });

    setPlayer({
      x: GAME_CONFIG.PLAYER_START_X,
      y: GAME_CONFIG.PLAYER_START_Y,
      width: GAME_CONFIG.PLAYER_WIDTH,
      height: GAME_CONFIG.PLAYER_HEIGHT,
      speed: GAME_CONFIG.PLAYER_SPEED,
      health: GAME_CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
      shieldActive: false,
      rapidFire: false
    });

    setBullets([]);
    setEnemies([]);
    setPowerups([]);
    setParticles([]);
    
    enemySpawnTimerRef.current = 0;
    powerupSpawnTimerRef.current = 0;
    shootTimerRef.current = 0;
    shieldTimerRef.current = 0;
    rapidFireTimerRef.current = 0;
    bulletIdCounterRef.current = 0;
    enemyIdCounterRef.current = 0;
    powerupIdCounterRef.current = 0;
    particleIdCounterRef.current = 0;
    
    console.log('🎮 ByteRush: Top-down shooter initialized');
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
      let newY = prev.y;
      
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        newX = Math.max(0, newX - prev.speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        newX = Math.min(GAME_CONFIG.CANVAS_WIDTH - prev.width, newX + prev.speed);
      }
      if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
        newY = Math.max(0, newY - prev.speed);
      }
      if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
        newY = Math.min(GAME_CONFIG.CANVAS_HEIGHT - prev.height, newY + prev.speed);
      }
      
      return { ...prev, x: newX, y: newY };
    });
  }, []);

  // BYTECLUB: Player shooting
  const playerShoot = useCallback(() => {
    const shootInterval = player.rapidFire ? GAME_CONFIG.RAPIDFIRE_SHOOT_INTERVAL : 30;
    
    if (keysRef.current['Space'] && shootTimerRef.current <= 0) {
      setBullets(prev => [...prev, {
        id: `bullet-${bulletIdCounterRef.current++}`,
        x: player.x + player.width / 2 - GAME_CONFIG.BULLET_WIDTH / 2,
        y: player.y,
        width: GAME_CONFIG.BULLET_WIDTH,
        height: GAME_CONFIG.BULLET_HEIGHT,
        speed: GAME_CONFIG.BULLET_SPEED,
        type: 'player'
      }]);
      shootTimerRef.current = shootInterval;
    }
    
    if (shootTimerRef.current > 0) {
      shootTimerRef.current--;
    }
  }, [player]);

  // BYTECLUB: Update bullets
  const updateBullets = useCallback(() => {
    setBullets(prev => {
      return prev
        .map(bullet => {
          if (bullet.type === 'player') {
            return { ...bullet, y: bullet.y - bullet.speed };
          } else {
            return { ...bullet, y: bullet.y + bullet.speed };
          }
        })
        .filter(bullet => bullet.y > -bullet.height && bullet.y < GAME_CONFIG.CANVAS_HEIGHT);
    });
  }, []);

  // BYTECLUB: Spawn enemies
  const spawnEnemies = useCallback(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      enemySpawnTimerRef.current++;
      
      const spawnRate = Math.max(
        GAME_CONFIG.ENEMY_SPAWN_RATE - (gameState.wave - 1) * 15,
        GAME_CONFIG.ENEMY_SPAWN_RATE_MIN
      );
      
      if (enemySpawnTimerRef.current >= spawnRate) {
        setEnemies(prev => [...prev, createEnemy()]);
        enemySpawnTimerRef.current = 0;
      }
    }
  }, [gameState.isRunning, gameState.isPaused, gameState.wave, createEnemy]);

  // BYTECLUB: Update enemies
  const updateEnemies = useCallback(() => {
    setEnemies(prev => {
      return prev.map(enemy => {
        let newX = enemy.x + enemy.speedX;
        let newY = enemy.y + enemy.speedY;
        
        // Zigzag pattern
        if (enemy.type === 'zigzag') {
          enemy.speedX = Math.sin(enemy.y * 0.05) * 2;
        }
        
        return { ...enemy, x: newX, y: newY };
      }).filter(enemy => enemy.y < GAME_CONFIG.CANVAS_HEIGHT + 50 && enemy.y > -50);
    });
  }, []);

  // BYTECLUB: Collision detection
  const checkCollisions = useCallback(() => {
    // Player bullets vs enemies
    setBullets(prevBullets => {
      setEnemies(prevEnemies => {
        const newBullets: Bullet[] = [];
        const newEnemies: Enemy[] = [];
        
        for (const bullet of prevBullets) {
          let hit = false;
          
          for (const enemy of prevEnemies) {
            if (bullet.type === 'player' &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
              
              // Enemy hit
              const newHealth = enemy.health - 1;
              
              if (newHealth <= 0) {
                // Enemy destroyed
                setGameState(prev => ({
                  ...prev,
                  score: prev.score + enemy.points
                }));
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, COLORS.EXPLOSION, 15);
              } else {
                newEnemies.push({ ...enemy, health: newHealth });
              }
              
              hit = true;
              break;
            }
          }
          
          if (!hit) {
            newBullets.push(bullet);
          }
        }
        
        return newEnemies;
      });
      
      return prevBullets;
    });

    // Enemies vs player
    setEnemies(prevEnemies => {
      for (const enemy of prevEnemies) {
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
          
          // Player hit
          if (!player.shieldActive) {
            setPlayer(prev => {
              const newHealth = prev.health - 1;
              
              if (newHealth <= 0) {
                setGameState(prev => ({ ...prev, lives: prev.lives - 1, isRunning: false }));
                return prev;
              }
              
              return { ...prev, health: newHealth };
            });
          }
          
          createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, COLORS.EXPLOSION, 10);
          return prevEnemies.filter(e => e.id !== enemy.id);
        }
      }
      
      return prevEnemies;
    });
  }, [player, createParticles]);

  // BYTECLUB: Create particles
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${particleIdCounterRef.current++}`,
        x,
        y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        life: 20,
        maxLife: 20,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

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

  // BYTECLUB: Spawn powerups
  const spawnPowerups = useCallback(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      powerupSpawnTimerRef.current++;
      
      if (powerupSpawnTimerRef.current >= GAME_CONFIG.POWERUP_SPAWN_RATE) {
        const types: Powerup['type'][] = ['health', 'shield', 'rapidFire'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        setPowerups(prev => [...prev, {
          id: `powerup-${powerupIdCounterRef.current++}`,
          x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - 40),
          y: -40,
          size: 30,
          type: randomType
        }]);
        
        powerupSpawnTimerRef.current = 0;
      }
    }
  }, [gameState.isRunning, gameState.isPaused]);

  // BYTECLUB: Update powerups
  const updatePowerups = useCallback(() => {
    setPowerups(prev => {
      return prev
        .map(powerup => ({ ...powerup, y: powerup.y + 2 }))
        .filter(powerup => {
          // Check collision with player
          if (powerup.x < player.x + player.width &&
              powerup.x + powerup.size > player.x &&
              powerup.y < player.y + player.height &&
              powerup.y + powerup.size > player.y) {
            
            // Powerup collected
            setPlayer(prev => {
              const newPlayer = { ...prev };
              
              switch (powerup.type) {
                case 'health':
                  newPlayer.health = Math.min(prev.maxHealth, prev.health + 1);
                  break;
                case 'shield':
                  newPlayer.shieldActive = true;
                  shieldTimerRef.current = GAME_CONFIG.SHIELD_DURATION;
                  break;
                case 'rapidFire':
                  newPlayer.rapidFire = true;
                  rapidFireTimerRef.current = GAME_CONFIG.RAPIDFIRE_DURATION;
                  break;
              }
              
              return newPlayer;
            });
            
            createParticles(powerup.x + powerup.size / 2, powerup.y + powerup.size / 2, COLORS.POWERUP_SHIELD, 8);
            return false; // Remove powerup
          }
          
          return powerup.y < GAME_CONFIG.CANVAS_HEIGHT + 50;
        });
    });
  }, [player, createParticles]);

  // BYTECLUB: Update powerup timers
  const updatePowerupTimers = useCallback(() => {
    if (shieldTimerRef.current > 0) {
      shieldTimerRef.current--;
      if (shieldTimerRef.current <= 0) {
        setPlayer(prev => ({ ...prev, shieldActive: false }));
      }
    }
    
    if (rapidFireTimerRef.current > 0) {
      rapidFireTimerRef.current--;
      if (rapidFireTimerRef.current <= 0) {
        setPlayer(prev => ({ ...prev, rapidFire: false }));
      }
    }
  }, []);

  // BYTECLUB: Update wave progression
  const updateWave = useCallback(() => {
    if (gameState.isRunning && !gameState.isPaused && enemies.length === 0) {
      setGameState(prev => ({ ...prev, wave: prev.wave + 1 }));
    }
  }, [gameState.isRunning, gameState.isPaused, enemies.length]);

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
    playerShoot();
    updateBullets();
    spawnEnemies();
    updateEnemies();
    checkCollisions();
    updateParticles();
    spawnPowerups();
    updatePowerups();
    updatePowerupTimers();
    updateWave();

    // Update game time
    setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, gameState.isPaused, updatePlayer, playerShoot, updateBullets, spawnEnemies, updateEnemies, checkCollisions, updateParticles, spawnPowerups, updatePowerups, updatePowerupTimers, updateWave]);

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
    bullets,
    enemies,
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
