import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useGameEngine, GameState, Ball, Paddle, Brick, Powerup } from '@/hooks/useGameEngine';

// BYTECLUB: Canvas ref interface
export interface GameCanvasRef {
  startGame: () => void;
  stopGame: () => void;
  initializeGame: () => void;
}

// BYTECLUB: Props interface
interface GameCanvasProps {
  onGameStateChange: (gameState: GameState) => void;
}

// BYTECLUB: HTML5 Canvas game component for brick-breaker
export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ onGameStateChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
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
  } = useGameEngine();

  // BYTECLUB: Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startGame,
    stopGame,
    initializeGame
  }));

  // BYTECLUB: Notify parent of game state changes
  useEffect(() => {
    onGameStateChange(gameState);
  }, [gameState, onGameStateChange]);

  // BYTECLUB: Set up canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // BYTECLUB: Set canvas size
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // BYTECLUB: Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, GAME_CONFIG]);

  // BYTECLUB: Render game objects using animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // BYTECLUB: Clear canvas
      ctx.fillStyle = COLORS.BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // BYTECLUB: Draw bricks
      bricks.forEach(brick => {
        if (!brick.broken) {
          // BYTECLUB: Draw brick with glow effect
          ctx.shadowColor = brick.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          
          // BYTECLUB: Draw brick border
          ctx.shadowBlur = 0;
          ctx.strokeStyle = COLORS.TEXT;
          ctx.lineWidth = 1;
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
      });

      // BYTECLUB: Draw paddle with glow effect
      ctx.shadowColor = COLORS.PADDLE;
      ctx.shadowBlur = 15;
      ctx.fillStyle = COLORS.PADDLE;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.shadowBlur = 0;

      // BYTECLUB: Draw ball with glow effect
      ctx.shadowColor = COLORS.BALL;
      ctx.shadowBlur = 15;
      ctx.fillStyle = COLORS.BALL;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // BYTECLUB: Draw powerups
      powerups.forEach(powerup => {
        if (!powerup.collected) {
          const color = COLORS.POWERUPS[powerup.type as keyof typeof COLORS.POWERUPS] || COLORS.PADDLE;
          
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(powerup.x, powerup.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // BYTECLUB: Draw powerup icon
          ctx.fillStyle = COLORS.TEXT;
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          let icon = '';
          switch (powerup.type) {
            case 'tryCatch':
              icon = '🛡️';
              break;
            case 'garbageCollector':
              icon = '🗑️';
              break;
            case 'debuggerDrone':
              icon = '🐛';
              break;
            case 'optimizationBoost':
              icon = '⚡';
              break;
          }
          
          ctx.fillText(icon, powerup.x, powerup.y);
        }
      });

      // BYTECLUB: Draw particles
      particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // BYTECLUB: Draw powerup effects
      if (gameState.activePowerups.includes('tryCatch')) {
        // BYTECLUB: Draw shield effect around paddle
        ctx.strokeStyle = COLORS.POWERUPS.tryCatch;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(paddle.x - 5, paddle.y - 5, paddle.width + 10, paddle.height + 10);
        ctx.setLineDash([]);
      }

      if (gameState.activePowerups.includes('debuggerDrone')) {
        // BYTECLUB: Draw auto-aim effect
        ctx.strokeStyle = COLORS.POWERUPS.debuggerDrone;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(paddle.x + paddle.width / 2, paddle.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (gameState.activePowerups.includes('optimizationBoost')) {
        // BYTECLUB: Draw slow-motion effect
        ctx.fillStyle = 'rgba(160, 32, 240, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [ball, paddle, bricks, powerups, particles, gameState.activePowerups, COLORS, GAME_CONFIG]);

  // BYTECLUB: Start game when component mounts
  useEffect(() => {
    initializeGame();
    startGame();
    
    return () => {
      stopGame();
    };
  }, [initializeGame, startGame, stopGame]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-400/20"
        style={{ 
          background: COLORS.BACKGROUND,
          imageRendering: 'pixelated' // For crisp pixel art look
        }}
      />
      
      {/* BYTECLUB: Game overlay messages */}
      {gameState.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-4">PAUSED</div>
            <div className="text-white">Press P to resume</div>
          </div>
        </div>
      )}
      
      {!gameState.isRunning && gameState.lives === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400 mb-4">GAME OVER</div>
            <div className="text-white">Final Score: {gameState.score.toLocaleString()}</div>
          </div>
        </div>
      )}
      
      {!gameState.isRunning && gameState.lives > 0 && bricks.filter(brick => !brick.broken).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-4">LEVEL COMPLETE!</div>
            <div className="text-white">Score: {gameState.score.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';