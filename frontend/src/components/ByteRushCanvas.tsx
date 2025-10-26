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

  // BYTECLUB: Render game on canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // BYTECLUB: Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BYTECLUB: Draw grid background
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // BYTECLUB: Draw particles (explosions)
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(particle.position.x, particle.position.y, 3, 3);
    });

    // BYTECLUB: Draw bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffff';
      ctx.fillRect(bullet.position.x, bullet.position.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    // BYTECLUB: Draw enemies
    enemies.forEach(enemy => {
      const colors = {
        normal: '#4ecdc4',
        fast: '#ffd93d',
        tank: '#ff6b6b',
        zigzag: '#a8e6cf'
      };

      ctx.fillStyle = colors[enemy.type];
      ctx.shadowBlur = 15;
      ctx.shadowColor = colors[enemy.type];
      
      // BYTECLUB: Draw enemy shape (triangle facing down)
      ctx.beginPath();
      ctx.moveTo(enemy.position.x + enemy.width / 2, enemy.position.y);
      ctx.lineTo(enemy.position.x, enemy.position.y + enemy.height);
      ctx.lineTo(enemy.position.x + enemy.width, enemy.position.y + enemy.height);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // BYTECLUB: Draw health bar for tank enemies
      if (enemy.type === 'tank' && enemy.health > 1) {
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, enemy.width, 5);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(enemy.position.x, enemy.position.y - 10, (enemy.width * enemy.health) / 3, 5);
      }
    });

    // BYTECLUB: Draw power-ups
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        const colors = {
          health: '#ff6b6b',
          rapid: '#4ecdc4',
          shield: '#ffe66d'
        };
        const symbols = {
          health: '+',
          rapid: '⚡',
          shield: '🛡'
        };

        ctx.fillStyle = colors[powerUp.type];
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[powerUp.type];
        ctx.fillRect(powerUp.position.x, powerUp.position.y, 30, 30);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(symbols[powerUp.type], powerUp.position.x + 15, powerUp.position.y + 20);
      }
    });

    // BYTECLUB: Draw player
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    
    // BYTECLUB: Draw player shape (triangle facing up)
    ctx.beginPath();
    ctx.moveTo(player.position.x + player.width / 2, player.position.y + player.height);
    ctx.lineTo(player.position.x, player.position.y);
    ctx.lineTo(player.position.x + player.width, player.position.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // BYTECLUB: Draw player exhaust
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(
      player.position.x + player.width / 2 - 5, 
      player.position.y + player.height, 
      10, 
      10
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
      style={{ background: '#0a0a0f' }}
    />
  );
}
