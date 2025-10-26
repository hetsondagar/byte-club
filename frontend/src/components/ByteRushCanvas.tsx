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

    // BYTECLUB: Clear canvas with dark background and animated grid
    const time = Date.now() * 0.001;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BYTECLUB: Draw animated grid background
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    const gridOffset = (time * 10) % 50;
    
    // Vertical lines
    for (let x = -50 + gridOffset; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -50 + gridOffset; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // BYTECLUB: Draw particles (explosions) with enhanced effects
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = 3 + (1 - alpha) * 3;
      
      // BYTECLUB: Draw particle with glow
      const gradient = ctx.createRadialGradient(
        particle.position.x, particle.position.y,
        0,
        particle.position.x, particle.position.y,
        size
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // BYTECLUB: Draw bullets with glow effect
    bullets.forEach(bullet => {
      // BYTECLUB: Draw bullet with gradient
      const gradient = ctx.createLinearGradient(bullet.position.x, bullet.position.y, bullet.position.x, bullet.position.y + bullet.height);
      gradient.addColorStop(0, '#00ffff');
      gradient.addColorStop(1, '#0099ff');
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      
      // BYTECLUB: Draw bullet as elongated capsule
      ctx.beginPath();
      ctx.arc(bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(bullet.position.x, bullet.position.y + bullet.height / 4, bullet.width, bullet.height / 2);
      ctx.shadowBlur = 0;
    });

    // BYTECLUB: Draw enemies as detailed ships with animation
    const animTime = Date.now() * 0.005;
    enemies.forEach((enemy, index) => {
      const colors = {
        normal: { main: '#4ecdc4', glow: '#00ffcc', secondary: '#0088ff' },
        fast: { main: '#ffd93d', glow: '#ffaa00', secondary: '#ff6600' },
        tank: { main: '#ff6b6b', glow: '#ff3333', secondary: '#cc0000' },
        zigzag: { main: '#a8e6cf', glow: '#66ffaa', secondary: '#00ff88' }
      };

      const color = colors[enemy.type];
      const centerX = enemy.position.x + enemy.width / 2;
      const centerY = enemy.position.y + enemy.height / 2;
      
      // BYTECLUB: Pulsing glow effect
      const pulse = Math.sin(animTime + index) * 0.3 + 0.7;

      // BYTECLUB: Draw ship body with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, enemy.width / 2);
      gradient.addColorStop(0, color.main);
      gradient.addColorStop(1, color.secondary);
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color.glow;
      
      // BYTECLUB: Draw ship hull (ship shape)
      ctx.beginPath();
      ctx.moveTo(centerX, enemy.position.y + 5); // Top center
      ctx.lineTo(enemy.position.x + enemy.width * 0.3, enemy.position.y + enemy.height * 0.6); // Left wing
      ctx.lineTo(enemy.position.x, enemy.position.y + enemy.height); // Left bottom
      ctx.lineTo(enemy.position.x + enemy.width * 0.3, enemy.position.y + enemy.height * 0.8); // Left inner
      ctx.lineTo(centerX, enemy.position.y + enemy.height * 0.85); // Center bottom
      ctx.lineTo(enemy.position.x + enemy.width * 0.7, enemy.position.y + enemy.height * 0.8); // Right inner
      ctx.lineTo(enemy.position.x + enemy.width, enemy.position.y + enemy.height); // Right bottom
      ctx.lineTo(enemy.position.x + enemy.width * 0.7, enemy.position.y + enemy.height * 0.6); // Right wing
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // BYTECLUB: Draw cockpit
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, enemy.position.y + enemy.height * 0.4, enemy.width * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // BYTECLUB: Draw health bar for tank enemies
      if (enemy.type === 'tank' && enemy.health > 1) {
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.position.x, enemy.position.y - 12, enemy.width, 6);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(enemy.position.x + 1, enemy.position.y - 11, (enemy.width - 2) * (enemy.health / 3), 4);
      }
    });

    // BYTECLUB: Draw power-ups with pulsing animation
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.15 + 1; // Pulsing effect
        
        const colors = {
          health: { main: '#ff6b6b', glow: '#ff3333' },
          rapid: { main: '#4ecdc4', glow: '#00ffff' },
          shield: { main: '#ffe66d', glow: '#ffff00' }
        };
        
        const symbols = {
          health: '❤',
          rapid: '⚡',
          shield: '🛡'
        };

        const color = colors[powerUp.type];
        const centerX = powerUp.position.x + 15;
        const centerY = powerUp.position.y + 15;
        const size = 15 * pulse;

        // BYTECLUB: Draw outer glow
        ctx.fillStyle = color.glow;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // BYTECLUB: Draw power-up circle
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
        gradient.addColorStop(0, color.main);
        gradient.addColorStop(1, color.glow);
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color.glow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // BYTECLUB: Draw symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbols[powerUp.type], centerX, centerY);
      }
    });

    // BYTECLUB: Draw player ship with detailed design
    const centerX = player.position.x + player.width / 2;
    const centerY = player.position.y + player.height / 2;

    // BYTECLUB: Draw exhaust trails
    const exhaustGradient = ctx.createLinearGradient(
      centerX, player.position.y + player.height,
      centerX, player.position.y + player.height + 20
    );
    exhaustGradient.addColorStop(0, '#ffff00');
    exhaustGradient.addColorStop(0.5, '#ff9900');
    exhaustGradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
    
    ctx.fillStyle = exhaustGradient;
    ctx.fillRect(
      centerX - 8, 
      player.position.y + player.height, 
      16, 
      25
    );

    // BYTECLUB: Draw player ship body with gradient
    const shipGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, player.width / 2);
    shipGradient.addColorStop(0, '#00ffff');
    shipGradient.addColorStop(0.5, '#0099ff');
    shipGradient.addColorStop(1, '#0066cc');
    
    ctx.fillStyle = shipGradient;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00ffff';
    
    // BYTECLUB: Draw ship hull (detailed fighter shape)
    ctx.beginPath();
    // Top wingtips
    ctx.moveTo(centerX, player.position.y + 5);
    ctx.lineTo(centerX - player.width * 0.4, player.position.y + player.height * 0.3);
    ctx.lineTo(centerX - player.width * 0.15, player.position.y + player.height * 0.4);
    ctx.lineTo(centerX - player.width * 0.1, player.position.y + player.height * 0.6);
    // Bottom left
    ctx.lineTo(centerX - player.width * 0.2, player.position.y + player.height * 0.85);
    ctx.lineTo(centerX - player.width * 0.1, player.position.y + player.height - 5);
    // Center bottom
    ctx.lineTo(centerX, player.position.y + player.height);
    // Bottom right
    ctx.lineTo(centerX + player.width * 0.1, player.position.y + player.height - 5);
    ctx.lineTo(centerX + player.width * 0.2, player.position.y + player.height * 0.85);
    ctx.lineTo(centerX + player.width * 0.1, player.position.y + player.height * 0.6);
    ctx.lineTo(centerX + player.width * 0.15, player.position.y + player.height * 0.4);
    ctx.lineTo(centerX + player.width * 0.4, player.position.y + player.height * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // BYTECLUB: Draw cockpit
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(centerX, player.position.y + player.height * 0.35, player.width * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // BYTECLUB: Draw ship details
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, player.position.y + player.height * 0.3);
    ctx.lineTo(centerX, player.position.y + player.height * 0.5);
    ctx.stroke();
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
