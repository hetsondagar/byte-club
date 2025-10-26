import { useEffect, useRef } from 'react';
import { Player, Bullet, Enemy, PowerUp, Particle, GAME_CONFIG } from '../hooks/useByteRushGame';

interface ByteRushCanvasProps {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  particles: Particle[];
  gameConfig: typeof GAME_CONFIG;
}

export function ByteRushCanvas({ 
  player, 
  bullets, 
  enemies, 
  powerUps, 
  particles, 
  gameConfig 
}: ByteRushCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const starsRef = useRef<Array<{x: number, y: number, z: number, speed: number}>>([]);

  // BYTECLUB: Initialize stars for enhanced 3D space effect
  useEffect(() => {
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 500; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 1000,
          speed: 0.5 + Math.random() * 2
        });
      }
    }
  }, []);

  // BYTECLUB: Draw Galaga-style fighter ship
  const drawGalagaShip = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    color: string,
    glowColor: string
  ) => {
    // BYTECLUB: Ship body - main triangle
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    
    ctx.beginPath();
    // Top point (nose)
    ctx.moveTo(x + width / 2, y);
    // Left wing corner
    ctx.lineTo(x + width * 0.1, y + height * 0.4);
    // Left wing tip
    ctx.lineTo(x, y + height * 0.5);
    // Left bottom
    ctx.lineTo(x + width * 0.2, y + height);
    // Center bottom
    ctx.lineTo(x + width * 0.5, y + height * 0.9);
    // Right bottom
    ctx.lineTo(x + width * 0.8, y + height);
    // Right wing tip
    ctx.lineTo(x + width, y + height * 0.5);
    // Right wing corner
    ctx.lineTo(x + width * 0.9, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // BYTECLUB: Draw cockpit window
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.3, width * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // BYTECLUB: Draw thruster glow
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.9, width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  // BYTECLUB: Draw enhanced explosion
  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) => {
    // BYTECLUB: Outer ring
    ctx.fillStyle = `rgba(255, 165, 0, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // BYTECLUB: Middle ring
    ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // BYTECLUB: Inner core
    ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // BYTECLUB: Draw enhanced bullet
  const drawBullet = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    // BYTECLUB: Bullet glow trail
    const gradient = ctx.createLinearGradient(x, y, x, y + height + 10);
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 1, y, width + 2, height + 10);
    
    // BYTECLUB: Main bullet body
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(x, y, width, height);
    
    // BYTECLUB: Bright core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
    ctx.shadowBlur = 0;
  };

  // BYTECLUB: Render game on canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now() * 0.001;
    
    // BYTECLUB: Clear canvas with deep space background
    ctx.fillStyle = '#000020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BYTECLUB: Draw enhanced 3D starfield effect with motion
    starsRef.current.forEach((star, index) => {
      star.z -= star.speed * 3;
      
      if (star.z < 1) {
        star.z = 1000;
        star.x = (Math.random() - 0.5) * 2000;
        star.y = (Math.random() - 0.5) * 2000;
      }
      
      const perspective = 1000 / star.z;
      const x = star.x * perspective + canvas.width / 2;
      const y = star.y * perspective + canvas.height / 2;
      const size = Math.max(1, perspective * 3);
      const brightness = Math.min(1, perspective);
      
      // BYTECLUB: Draw star with glow
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.shadowBlur = size * 3;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // BYTECLUB: Draw explosions first
    particles.forEach((particle, index) => {
      const alpha = particle.life / particle.maxLife;
      const size = 8 + (1 - alpha) * 12;
      drawExplosion(ctx, particle.position.x, particle.position.y, size, alpha);
    });

    // BYTECLUB: Draw bullets with enhanced graphics
    bullets.forEach(bullet => {
      drawBullet(ctx, bullet.position.x, bullet.position.y, bullet.width, bullet.height);
    });

    // BYTECLUB: Draw enemies as Galaga-style fighters
    enemies.forEach(enemy => {
      const colors: Record<string, { main: string, glow: string }> = {
        normal: { main: '#4ecdc4', glow: '#00ffff' },
        fast: { main: '#ffd93d', glow: '#ffff00' },
        tank: { main: '#ff6b6b', glow: '#ff0000' },
        zigzag: { main: '#a8e6cf', glow: '#00ff88' }
      };

      const color = colors[enemy.type];
      drawGalagaShip(ctx, enemy.position.x, enemy.position.y, enemy.width, enemy.height, color.main, color.glow);
      
      // BYTECLUB: Draw health bar for tanks
      if (enemy.type === 'tank' && enemy.health > 1) {
        ctx.fillStyle = '#330000';
        ctx.fillRect(enemy.position.x, enemy.position.y - 15, enemy.width, 8);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(enemy.position.x + 2, enemy.position.y - 13, (enemy.width - 4) * (enemy.health / 3), 4);
      }
    });

    // BYTECLUB: Draw power-ups
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.2 + 1;
        
        const colors: Record<string, { main: string, glow: string }> = {
          health: { main: '#ff6b6b', glow: '#ff0000' },
          rapid: { main: '#4ecdc4', glow: '#00ffff' },
          shield: { main: '#ffe66d', glow: '#ffff00' }
        };
        
        const color = colors[powerUp.type];
        const centerX = powerUp.position.x + 15;
        const centerY = powerUp.position.y + 15;
        const size = 12 * pulse;
        
        // BYTECLUB: Outer glow
        ctx.fillStyle = color.glow + '40';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size + 8, 0, Math.PI * 2);
        ctx.fill();
        
        // BYTECLUB: Main circle
        ctx.fillStyle = color.main;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color.glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // BYTECLUB: Symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = powerUp.type === 'health' ? '❤' : powerUp.type === 'rapid' ? '⚡' : '🛡';
        ctx.fillText(symbol, centerX, centerY);
      }
    });

    // BYTECLUB: Draw player ship as Galaga-style fighter
    const playerColor = '#00ffff';
    const playerGlow = '#00ccff';
    drawGalagaShip(ctx, player.position.x, player.position.y, player.width, player.height, playerColor, playerGlow);
    
    // BYTECLUB: Draw enhanced exhaust trail
    const exhaustGradient = ctx.createLinearGradient(
      player.position.x + player.width / 2, player.position.y + player.height,
      player.position.x + player.width / 2, player.position.y + player.height + 30
    );
    exhaustGradient.addColorStop(0, '#ffff00');
    exhaustGradient.addColorStop(0.3, '#ff9900');
    exhaustGradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
    ctx.fillStyle = exhaustGradient;
    ctx.fillRect(
      player.position.x + player.width / 2 - 6, 
      player.position.y + player.height, 
      12, 
      30
    );
  };

  // BYTECLUB: Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [player, bullets, enemies, powerUps, particles]);

  return (
    <canvas
      ref={canvasRef}
      width={gameConfig.CANVAS_WIDTH}
      height={gameConfig.CANVAS_HEIGHT}
      className="rounded-lg border-2 border-primary/30 shadow-2xl"
      style={{ background: '#000020' }}
    />
  );
}
