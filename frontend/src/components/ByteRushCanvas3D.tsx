import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Player, Bullet, Enemy, PowerUp, Particle, GAME_CONFIG } from '../hooks/useByteRushGame';

interface ByteRushCanvasProps {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  particles: Particle[];
  gameConfig: typeof GAME_CONFIG;
}

export function ByteRushCanvas3D({ 
  player, 
  bullets, 
  enemies, 
  powerUps, 
  particles, 
  gameConfig 
}: ByteRushCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  
  // BYTECLUB: Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // BYTECLUB: Create scene with deep black space
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black space
    sceneRef.current = scene;

    // BYTECLUB: Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gameConfig.CANVAS_WIDTH / gameConfig.CANVAS_HEIGHT,
      0.1,
      10000
    );
    camera.position.z = 1000;
    cameraRef.current = camera;

    // BYTECLUB: Create renderer with black background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(gameConfig.CANVAS_WIDTH, gameConfig.CANVAS_HEIGHT);
    renderer.setClearColor(0x000000, 1); // Pure black
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // BYTECLUB: Create optimized starfield - reduced count for performance
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1500; // Reduced from 5000 for better performance
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // BYTECLUB: Random star positions in 3D space
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = Math.random() * 3000 - 1000;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // BYTECLUB: Random star colors (white to blue spectrum)
      const intensity = Math.random();
      colors[i * 3] = 0.5 + intensity * 0.5; // R
      colors[i * 3 + 1] = 0.5 + intensity * 0.5; // G
      colors[i * 3 + 2] = 0.8 + intensity * 0.2; // B
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 2.5, // Slightly larger to compensate for fewer stars
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starFieldRef.current = stars;

    // BYTECLUB: Create ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // BYTECLUB: Animate function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // BYTECLUB: Rotate starfield for motion
      if (starFieldRef.current) {
        starFieldRef.current.rotation.y += 0.0005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [gameConfig]);

  // BYTECLUB: Draw game objects on 2D overlay canvas
  useEffect(() => {
    // BYTECLUB: Create 2D canvas overlay for game sprites
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = gameConfig.CANVAS_WIDTH;
    overlayCanvas.height = gameConfig.CANVAS_HEIGHT;
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.top = '0';
    overlayCanvas.style.left = '0';
    overlayCanvas.style.pointerEvents = 'none';
    
    if (containerRef.current) {
      containerRef.current.appendChild(overlayCanvas);
    }

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // BYTECLUB: Draw particles (explosions) - optimized
      particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        const size = 8 + (1 - alpha) * 15;
        
        // BYTECLUB: Simplified explosion with solid colors for better performance
        ctx.fillStyle = `rgba(255, ${165 + Math.floor(alpha * 50)}, 0, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(particle.position.x, particle.position.y, size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // BYTECLUB: Inner bright core
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(particle.position.x, particle.position.y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // BYTECLUB: Draw bullets - optimized without gradients
      bullets.forEach(bullet => {
        // BYTECLUB: Laser trail with solid colors
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.fillRect(bullet.position.x - 1, bullet.position.y, bullet.width + 2, bullet.height + 10);
        
        // BYTECLUB: Bullet core with simple glow
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(bullet.position.x, bullet.position.y, bullet.width, bullet.height);
        
        // BYTECLUB: Bright center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bullet.position.x + 1, bullet.position.y + 1, bullet.width - 2, bullet.height - 2);
      });
      
      // BYTECLUB: Draw distinctive enemy ships
      enemies.forEach(enemy => {
        const colors = {
          normal: { main: '#4ecdc4', glow: '#00ffff' },
          fast: { main: '#ffd93d', glow: '#ffff00' },
          tank: { main: '#ff6b6b', glow: '#ff0000' },
          zigzag: { main: '#a8e6cf', glow: '#00ff88' }
        };
        
        const color = colors[enemy.type];
        drawEnemyShip(ctx, enemy.type, enemy.position.x, enemy.position.y, enemy.width, enemy.height, color.main, color.glow);
        
        // BYTECLUB: Health bar for tanks
        if (enemy.type === 'tank' && enemy.health > 1) {
          ctx.fillStyle = '#330000';
          ctx.fillRect(enemy.position.x, enemy.position.y - 15, enemy.width, 8);
          ctx.fillStyle = '#ff6b6b';
          ctx.fillRect(enemy.position.x + 2, enemy.position.y - 13, (enemy.width - 4) * (enemy.health / 3), 4);
        }
      });
      
      // BYTECLUB: Draw power-ups with pulsing animation
      powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
          const time = Date.now() * 0.005;
          const pulse = Math.sin(time) * 0.2 + 1;
          
          const colors: Record<string, { main: string, glow: string, symbol: string }> = {
            health: { main: '#ff6b6b', glow: '#ff0000', symbol: '❤' },
            rapid: { main: '#4ecdc4', glow: '#00ffff', symbol: '⚡' },
            shield: { main: '#ffe66d', glow: '#ffff00', symbol: '🛡' }
          };
          
          const powerUpData = colors[powerUp.type];
          const centerX = powerUp.position.x + 15;
          const centerY = powerUp.position.y + 15;
          const size = 15 * pulse;
          
          // BYTECLUB: Outer glow
          ctx.fillStyle = powerUpData.glow + '40';
          ctx.beginPath();
          ctx.arc(centerX, centerY, size + 8, 0, Math.PI * 2);
          ctx.fill();
          
          // BYTECLUB: Main circle - solid color for performance
          ctx.fillStyle = powerUpData.main;
          ctx.beginPath();
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.fill();
          
          // BYTECLUB: Symbol
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(powerUpData.symbol, centerX, centerY);
        }
      });
      
      // BYTECLUB: Draw player ship (always classic triangle) - optimized
      ctx.fillStyle = '#00ffff';
      
      ctx.beginPath();
      ctx.moveTo(player.position.x + player.width / 2, player.position.y);
      ctx.lineTo(player.position.x + player.width * 0.1, player.position.y + player.height * 0.4);
      ctx.lineTo(player.position.x, player.position.y + player.height * 0.5);
      ctx.lineTo(player.position.x + player.width * 0.2, player.position.y + player.height);
      ctx.lineTo(player.position.x + player.width * 0.5, player.position.y + player.height * 0.9);
      ctx.lineTo(player.position.x + player.width * 0.8, player.position.y + player.height);
      ctx.lineTo(player.position.x + player.width, player.position.y + player.height * 0.5);
      ctx.lineTo(player.position.x + player.width * 0.9, player.position.y + player.height * 0.4);
      ctx.closePath();
      ctx.fill();
      
      // BYTECLUB: Cockpit
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(player.position.x + player.width / 2, player.position.y + player.height * 0.3, player.width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      
      // BYTECLUB: Thruster
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(player.position.x + player.width / 2, player.position.y + player.height * 0.9, player.width * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // BYTECLUB: Draw exhaust trail - solid color for performance
      ctx.fillStyle = 'rgba(255, 153, 0, 0.7)';
      ctx.fillRect(
        player.position.x + player.width / 2 - 6,
        player.position.y + player.height,
        12,
        30
      );
      
      requestAnimationFrame(render);
    };
    
    render();

    return () => {
      if (containerRef.current && overlayCanvas.parentNode) {
        containerRef.current.removeChild(overlayCanvas);
      }
    };
  }, [player, bullets, enemies, particles]);

  // BYTECLUB: Draw different ship types with distinctive shapes
  const drawEnemyShip = (
    ctx: CanvasRenderingContext2D,
    type: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    glowColor: string
  ) => {
    ctx.fillStyle = color;
    // Removed shadowBlur for better performance
    
    ctx.beginPath();
    
    if (type === 'normal') {
      // BYTECLUB: Classic triangle fighter
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width * 0.1, y + height * 0.4);
      ctx.lineTo(x, y + height * 0.5);
      ctx.lineTo(x + width * 0.2, y + height);
      ctx.lineTo(x + width * 0.5, y + height * 0.9);
      ctx.lineTo(x + width * 0.8, y + height);
      ctx.lineTo(x + width, y + height * 0.5);
      ctx.lineTo(x + width * 0.9, y + height * 0.4);
    } else if (type === 'fast') {
      // BYTECLUB: Sleek arrow shape
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width * 0.3, y + height * 0.3);
      ctx.lineTo(x + width * 0.1, y + height * 0.6);
      ctx.lineTo(x + width * 0.4, y + height);
      ctx.lineTo(x + width * 0.6, y + height);
      ctx.lineTo(x + width * 0.9, y + height * 0.6);
      ctx.lineTo(x + width * 0.7, y + height * 0.3);
    } else if (type === 'tank') {
      // BYTECLUB: Wide heavy shape
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width * 0.2, y + height * 0.3);
      ctx.lineTo(x, y + height * 0.5);
      ctx.lineTo(x, y + height * 0.8);
      ctx.lineTo(x + width * 0.2, y + height);
      ctx.lineTo(x + width * 0.8, y + height);
      ctx.lineTo(x + width, y + height * 0.8);
      ctx.lineTo(x + width, y + height * 0.5);
      ctx.lineTo(x + width * 0.8, y + height * 0.3);
    } else if (type === 'zigzag') {
      // BYTECLUB: Diamond with wings
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width * 0.7, y + height * 0.3);
      ctx.lineTo(x + width, y + height * 0.5);
      ctx.lineTo(x + width * 0.7, y + height * 0.7);
      ctx.lineTo(x + width / 2, y + height * 0.9);
      ctx.lineTo(x + width * 0.3, y + height * 0.7);
      ctx.lineTo(x, y + height * 0.5);
      ctx.lineTo(x + width * 0.3, y + height * 0.3);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // BYTECLUB: Cockpit
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.3, width * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // BYTECLUB: Thruster
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.9, width * 0.15, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: gameConfig.CANVAS_WIDTH,
        height: gameConfig.CANVAS_HEIGHT,
        position: 'relative',
        border: '2px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#000000'
      }}
    />
  );
}
