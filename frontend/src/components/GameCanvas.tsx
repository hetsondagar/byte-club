import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

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

// BYTECLUB: Powerup interface
interface Powerup {
  id: string;
  type: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  collected: boolean;
}

// BYTECLUB: Obstacle interface
interface Obstacle {
  id: string;
  type: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  passed: boolean;
}

// BYTECLUB: Game Canvas component with Three.js WebGL engine
export function GameCanvas({ onGameStateChange }: { onGameStateChange: (state: GameState) => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerRef = useRef<THREE.Mesh>();
  const gameStateRef = useRef<GameState>({
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

  const [gameState, setGameState] = useState<GameState>(gameStateRef.current);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // BYTECLUB: Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e14);
    scene.fog = new THREE.Fog(0x0a0e14, 10, 100);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    canvasRef.current.appendChild(renderer.domElement);

    // BYTECLUB: Create lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00fff9, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // BYTECLUB: Create neon grid background
    const gridGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00fff9,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -5;
    scene.add(grid);

    // BYTECLUB: Create player (glowing cube)
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({
      color: 0x00fff9,
      emissive: 0x00fff9,
      emissiveIntensity: 0.3,
      shininess: 100
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0, 0);
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);
    playerRef.current = player;

    // BYTECLUB: Create particle system for background
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = new THREE.Color();
      color.setHSL(0.5 + Math.random() * 0.1, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // BYTECLUB: Start game loop
    const animate = (currentTime: number) => {
      if (!gameStateRef.current.isRunning || gameStateRef.current.isPaused) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // BYTECLUB: Update game state
      updateGameState(deltaTime);
      
      // BYTECLUB: Update player position
      updatePlayer(deltaTime);
      
      // BYTECLUB: Update obstacles
      updateObstacles(deltaTime);
      
      // BYTECLUB: Update collectibles
      updateCollectibles(deltaTime);
      
      // BYTECLUB: Check collisions
      checkCollisions();
      
      // BYTECLUB: Spawn new objects
      spawnObjects(deltaTime);
      
      // BYTECLUB: Update camera
      updateCamera(deltaTime);
      
      // BYTECLUB: Rotate background elements
      grid.rotation.z += 0.001;
      particleSystem.rotation.y += 0.0005;
      
      // BYTECLUB: Render scene
      renderer.render(scene, camera);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    // BYTECLUB: Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // BYTECLUB: Handle keyboard input
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.code] = true;
      
      if (event.code === 'Space') {
        event.preventDefault();
        jump();
      } else if (event.code === 'KeyP') {
        event.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // BYTECLUB: Start the game
    startGame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // BYTECLUB: Start the game
  const startGame = () => {
    gameStateRef.current.isRunning = true;
    gameStateRef.current.isPaused = false;
    gameStateRef.current.score = 0;
    gameStateRef.current.distance = 0;
    gameStateRef.current.commits = 0;
    gameStateRef.current.gameSpeed = 1;
    gameStateRef.current.obstacles = [];
    gameStateRef.current.collectibles = [];
    gameStateRef.current.activePowerups = [];
    
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
  };

  // BYTECLUB: Update game state
  const updateGameState = (deltaTime: number) => {
    gameStateRef.current.distance += deltaTime * 10 * gameStateRef.current.gameSpeed;
    gameStateRef.current.score = Math.floor(gameStateRef.current.distance * 10);
    
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
  };

  // BYTECLUB: Update player
  const updatePlayer = (deltaTime: number) => {
    if (!playerRef.current) return;

    // BYTECLUB: Handle jumping
    if (keysRef.current['Space'] && playerRef.current.position.y <= 0.1) {
      jump();
    }

    // BYTECLUB: Handle sliding
    if (keysRef.current['ArrowDown']) {
      playerRef.current.scale.y = 0.5;
      playerRef.current.position.y = -0.25;
    } else {
      playerRef.current.scale.y = 1;
      playerRef.current.position.y = Math.max(0, playerRef.current.position.y - deltaTime * 5);
    }

    // BYTECLUB: Update player position in game state
    gameStateRef.current.playerPosition = {
      x: playerRef.current.position.x,
      y: playerRef.current.position.y,
      z: playerRef.current.position.z
    };
  };

  // BYTECLUB: Jump function
  const jump = () => {
    if (!playerRef.current) return;
    playerRef.current.position.y = 2;
  };

  // BYTECLUB: Toggle pause
  const togglePause = () => {
    gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
  };

  // BYTECLUB: Update obstacles
  const updateObstacles = (deltaTime: number) => {
    gameStateRef.current.obstacles.forEach((obstacle, index) => {
      obstacle.position.z += deltaTime * 20 * gameStateRef.current.gameSpeed;
      
      if (obstacle.position.z > 20) {
        sceneRef.current?.remove(obstacle.mesh);
        gameStateRef.current.obstacles.splice(index, 1);
      }
    });
  };

  // BYTECLUB: Update collectibles
  const updateCollectibles = (deltaTime: number) => {
    gameStateRef.current.collectibles.forEach((collectible, index) => {
      collectible.position.z += deltaTime * 20 * gameStateRef.current.gameSpeed;
      collectible.mesh.rotation.y += deltaTime * 5;
      
      if (collectible.position.z > 20) {
        sceneRef.current?.remove(collectible.mesh);
        gameStateRef.current.collectibles.splice(index, 1);
      }
    });
  };

  // BYTECLUB: Check collisions
  const checkCollisions = () => {
    if (!playerRef.current) return;

    const playerBox = new THREE.Box3().setFromObject(playerRef.current);

    // BYTECLUB: Check obstacle collisions
    gameStateRef.current.obstacles.forEach((obstacle) => {
      const obstacleBox = new THREE.Box3().setFromObject(obstacle.mesh);
      if (playerBox.intersectsBox(obstacleBox)) {
        handleCollision(obstacle);
      }
    });

    // BYTECLUB: Check collectible collisions
    gameStateRef.current.collectibles.forEach((collectible, index) => {
      const collectibleBox = new THREE.Box3().setFromObject(collectible.mesh);
      if (playerBox.intersectsBox(collectibleBox)) {
        collectCommit(collectible, index);
      }
    });
  };

  // BYTECLUB: Handle collision
  const handleCollision = (obstacle: Obstacle) => {
    // BYTECLUB: Check if player has Try-Catch Shield
    if (gameStateRef.current.activePowerups.includes('tryCatch')) {
      // BYTECLUB: Remove shield and obstacle
      gameStateRef.current.activePowerups = gameStateRef.current.activePowerups.filter(p => p !== 'tryCatch');
      sceneRef.current?.remove(obstacle.mesh);
      gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(o => o.id !== obstacle.id);
      return;
    }

    // BYTECLUB: Game over
    gameOver();
  };

  // BYTECLUB: Collect commit
  const collectCommit = (collectible: any, index: number) => {
    gameStateRef.current.commits++;
    gameStateRef.current.score += 100;
    
    sceneRef.current?.remove(collectible.mesh);
    gameStateRef.current.collectibles.splice(index, 1);
    
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
  };

  // BYTECLUB: Spawn objects
  const spawnObjects = (deltaTime: number) => {
    // BYTECLUB: Spawn obstacles
    if (Math.random() < 0.3 * deltaTime) {
      spawnObstacle();
    }

    // BYTECLUB: Spawn collectibles
    if (Math.random() < 0.2 * deltaTime) {
      spawnCollectible();
    }

    // BYTECLUB: Spawn powerups
    if (Math.random() < 0.1 * deltaTime) {
      spawnPowerup();
    }
  };

  // BYTECLUB: Spawn obstacle
  const spawnObstacle = () => {
    if (!sceneRef.current) return;

    const obstacleTypes = ['bug', 'exception', 'memoryLeak'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: type === 'bug' ? 0xff3bcf : type === 'exception' ? 0xff6b35 : 0xff0000,
      emissive: type === 'bug' ? 0xff3bcf : type === 'exception' ? 0xff6b35 : 0xff0000,
      emissiveIntensity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      0,
      -20
    );
    mesh.castShadow = true;
    
    sceneRef.current.add(mesh);
    
    const obstacle: Obstacle = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: mesh.position,
      mesh,
      passed: false
    };
    
    gameStateRef.current.obstacles.push(obstacle);
  };

  // BYTECLUB: Spawn collectible
  const spawnCollectible = () => {
    if (!sceneRef.current) return;

    const geometry = new THREE.OctahedronGeometry(0.5);
    const material = new THREE.MeshPhongMaterial({
      color: 0x7fff00,
      emissive: 0x7fff00,
      emissiveIntensity: 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 3,
      -20
    );
    
    sceneRef.current.add(mesh);
    
    const collectible = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'commit',
      position: mesh.position,
      mesh
    };
    
    gameStateRef.current.collectibles.push(collectible);
  };

  // BYTECLUB: Spawn powerup
  const spawnPowerup = () => {
    if (!sceneRef.current) return;

    const powerupTypes = ['tryCatch', 'garbageCollector', 'debuggerDrone', 'optimizationBoost', 'hotfix'];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    const geometry = new THREE.SphereGeometry(0.3);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00fff9,
      emissive: 0x00fff9,
      emissiveIntensity: 0.4
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 2 + 1,
      -20
    );
    
    sceneRef.current.add(mesh);
    
    const powerup: Powerup = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: mesh.position,
      mesh,
      collected: false
    };
    
    // BYTECLUB: Check collision with powerup
    const checkPowerupCollision = () => {
      if (!playerRef.current || powerup.collected) return;
      
      const playerBox = new THREE.Box3().setFromObject(playerRef.current);
      const powerupBox = new THREE.Box3().setFromObject(powerup.mesh);
      
      if (playerBox.intersectsBox(powerupBox)) {
        activatePowerup(powerup);
      }
    };
    
    // BYTECLUB: Add to scene and start checking collision
    sceneRef.current.add(mesh);
    const interval = setInterval(checkPowerupCollision, 100);
    
    // BYTECLUB: Clean up after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      sceneRef.current?.remove(mesh);
    }, 10000);
  };

  // BYTECLUB: Activate powerup
  const activatePowerup = (powerup: Powerup) => {
    powerup.collected = true;
    gameStateRef.current.activePowerups.push(powerup.type);
    sceneRef.current?.remove(powerup.mesh);
    
    // BYTECLUB: Apply powerup effects
    switch (powerup.type) {
      case 'tryCatch':
        // BYTECLUB: Shield effect
        break;
      case 'garbageCollector':
        // BYTECLUB: Clear obstacles
        gameStateRef.current.obstacles.forEach(obstacle => {
          sceneRef.current?.remove(obstacle.mesh);
        });
        gameStateRef.current.obstacles = [];
        break;
      case 'optimizationBoost':
        // BYTECLUB: Slow time
        gameStateRef.current.gameSpeed *= 0.5;
        setTimeout(() => {
          gameStateRef.current.gameSpeed *= 2;
        }, 4000);
        break;
    }
    
    // BYTECLUB: Remove powerup after duration
    setTimeout(() => {
      gameStateRef.current.activePowerups = gameStateRef.current.activePowerups.filter(p => p !== powerup.type);
    }, 5000);
    
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
  };

  // BYTECLUB: Update camera
  const updateCamera = (deltaTime: number) => {
    if (!cameraRef.current || !playerRef.current) return;
    
    // BYTECLUB: Follow player with slight offset
    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, playerRef.current.position.x, deltaTime * 2);
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, playerRef.current.position.y + 5, deltaTime * 2);
    cameraRef.current.lookAt(playerRef.current.position);
  };

  // BYTECLUB: Game over
  const gameOver = () => {
    gameStateRef.current.isRunning = false;
    setGameState({ ...gameStateRef.current });
    onGameStateChange(gameStateRef.current);
    
    // BYTECLUB: Show game over modal
    // This will be handled by the parent component
  };

  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full relative"
      style={{ background: 'linear-gradient(to bottom, #0a0e14, #000000)' }}
    />
  );
}
