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
  
  // BYTECLUB: Initialize stars for 3D space effect
  useEffect(() => {
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        starsRef.current.push({
          x: Math.random() * gameConfig.CANVAS_WIDTH,
          y: Math.random() * gameConfig.CANVAS_HEIGHT,
          z: Math.random() * 1000,
          speed: 0.5 + Math.random() * 1
        });
      }
    }
  }, []);

  // BYTECLUB: Render game on canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now() * 0.001;
    
    // BYTECLUB: Clear canvas with deep space background
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // BYTECLUB: Draw 3D starfield effect
    starsRef.current.forEach(star => {
      star.z -= star.speed * 2;
      
      if (star.z < 1) {
        star.z = 1000;
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      }
      
      const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
      const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;
      const size = (1000 / star.z) * 2;
      const brightness = (1000 / star.z);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.shadowBlur = size * 2;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // BYTECLUB: Draw particles (explosions) with advanced fire and blast effects
    particles.forEach((particle, index) => {
      const alpha = particle.life / particle.maxLife;
      const size = 5 + (1 - alpha) * 8;
      
      // BYTECLUB: Draw outer fire ring
      const outerRingGradient = ctx.createRadialGradient(
        particle.position.x, particle.position.y, 0,
        particle.position.x, particle.position.y, size * 1.5
      );
      outerRingGradient.addColorStop(0, particle.color);
      outerRingGradient.addColorStop(0.5, particle.color + '80');
      outerRingGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = outerRingGradient;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // BYTECLUB: Draw middle explosion layer
      const middleGradient = ctx.createRadialGradient(
        particle.position.x, particle.position.y, 0,
        particle.position.x, particle.position.y, size
      );
      const brightColor = particle.color === '#ff0000' ? '#ff6600' : particle.color === '#ff6600' ? '#ffaa00' : '#ffff00';
      middleGradient.addColorStop(0, brightColor);
      middleGradient.addColorStop(0.7, particle.color);
      middleGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = middleGradient;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // BYTECLUB: Draw inner white hot core
      const coreSize = size * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, coreSize, 0, Math.PI * 2);
      ctx.fill();
      
      // BYTECLUB: Add sparkle effect for some particles
      if (index % 5 === 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.position.x - size, particle.position.y);
        ctx.lineTo(particle.position.x + size, particle.position.y);
        ctx.moveTo(particle.position.x, particle.position.y - size);
        ctx.lineTo(particle.position.x, particle.position.y + size);
        ctx.stroke();
      }
    });

    // BYTECLUB: Draw bullets with enhanced laser graphics and fire trail
    bullets.forEach(bullet => {
      // BYTECLUB: Draw fire trail
      const fireGradient = ctx.createLinearGradient(
        bullet.position.x, bullet.position.y + bullet.height,
        bullet.position.x, bullet.position.y + bullet.height + 8
      );
      fireGradient.addColorStop(0, '#ffaa00');
      fireGradient.addColorStop(0.5, '#ff6600');
      fireGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = fireGradient;
      ctx.fillRect(bullet.position.x - 1, bullet.position.y + bullet.height - 2, bullet.width + 2, 10);
      
      // BYTECLUB: Draw main bullet with energy core
      const coreGradient = ctx.createRadialGradient(
        bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2, 0,
        bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2, bullet.width / 2
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.5, '#00ffff');
      coreGradient.addColorStop(1, '#0099ff');
      
      ctx.fillStyle = coreGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';
      
      ctx.beginPath();
      ctx.arc(bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // BYTECLUB: Draw outer glow
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2, bullet.width / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
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
