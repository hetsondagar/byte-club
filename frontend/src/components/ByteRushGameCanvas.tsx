import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useByteRushGameEngine, ByteRushGameState } from '@/hooks/useByteRushGameEngine';

// BYTECLUB: Canvas ref interface
export interface ByteRushGameCanvasRef {
  startGame: () => void;
  stopGame: () => void;
  initializeGame: () => void;
}

// BYTECLUB: Props interface
interface ByteRushGameCanvasProps {
  onGameStateChange: (gameState: ByteRushGameState) => void;
}

// BYTECLUB: HTML5 Canvas game component for Byte Rush
export const ByteRushGameCanvas = forwardRef<ByteRushGameCanvasRef, ByteRushGameCanvasProps>(
  ({ onGameStateChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
      gameState,
      player,
      blocks,
      particles,
      initializeGame,
      startGame,
      stopGame,
      handleKeyDown,
      handleKeyUp,
      GAME_CONFIG,
      COLORS
    } = useByteRushGameEngine();

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
      if (!canvas) {
        console.error('❌ ByteRushGameCanvas: Canvas ref is null');
        return;
      }

      console.log('🎮 ByteRushGameCanvas: Setting up canvas...', {
        width: GAME_CONFIG.CANVAS_WIDTH,
        height: GAME_CONFIG.CANVAS_HEIGHT
      });

      canvas.width = GAME_CONFIG.CANVAS_WIDTH;
      canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      console.log('🎮 ByteRushGameCanvas: Canvas setup complete');

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [handleKeyDown, handleKeyUp, GAME_CONFIG]);

    // BYTECLUB: Render game objects using animation frame loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ ByteRushGameCanvas: Canvas ref is null in render loop');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ ByteRushGameCanvas: Could not get 2D context');
        return;
      }

      console.log('🎮 ByteRushGameCanvas: Starting render loop...');
      let animationFrameId: number;
      let frameCount = 0;

      const render = () => {
        frameCount++;
        if (frameCount === 1) {
          console.log('🎮 ByteRushGameCanvas: First frame rendered');
        }

        // BYTECLUB: Clear canvas
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // BYTECLUB: Draw blocks
        blocks.forEach(block => {
          let blockColor = COLORS.BLOCK_GOOD;
          
          switch (block.type) {
            case 'bad':
              blockColor = COLORS.BLOCK_BAD;
              break;
            case 'powerup':
              blockColor = COLORS.BLOCK_POWERUP;
              break;
            default:
              blockColor = COLORS.BLOCK_GOOD;
          }

          // BYTECLUB: Draw block with glow effect
          ctx.shadowColor = blockColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = blockColor;
          ctx.fillRect(block.x, block.y, block.size, block.size);
          ctx.shadowBlur = 0;

          // BYTECLUB: Draw block border
          ctx.strokeStyle = COLORS.TEXT;
          ctx.lineWidth = 2;
          ctx.strokeRect(block.x, block.y, block.size, block.size);
        });

        // BYTECLUB: Draw player (neon cube)
        let playerColor = COLORS.PLAYER;
        if (player.shieldActive) {
          playerColor = COLORS.POWERUP_SHIELD;
        } else if (player.speedBoostActive) {
          playerColor = COLORS.POWERUP_SPEEDBOOST;
        }

        // BYTECLUB: Draw shield effect
        if (player.shieldActive) {
          ctx.strokeStyle = COLORS.POWERUP_SHIELD;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(player.x - 10, player.y - 10, player.width + 20, player.height + 20);
          ctx.setLineDash([]);
        }

        // BYTECLUB: Draw player with glow effect
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = playerColor;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;

        // BYTECLUB: Draw player border
        ctx.strokeStyle = COLORS.TEXT;
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x, player.y, player.width, player.height);

        // BYTECLUB: Draw particles
        particles.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // BYTECLUB: Draw UI elements
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // BYTECLUB: Draw score
        ctx.fillText(`Score: ${gameState.score.toLocaleString()}`, 10, 10);
        
        // BYTECLUB: Draw lives
        ctx.fillText(`Lives: ${gameState.lives}`, 10, 40);
        
        // BYTECLUB: Draw level
        ctx.fillText(`Level: ${gameState.level}`, 10, 70);
        
        // BYTECLUB: Draw multiplier
        if (gameState.multiplier > 1) {
          ctx.fillStyle = COLORS.POWERUP_MULTIPLIER;
          ctx.fillText(`x${gameState.multiplier} Multiplier!`, 10, 100);
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [player, blocks, particles, gameState, COLORS, GAME_CONFIG]);

    // BYTECLUB: Start game when component mounts
    useEffect(() => {
      console.log('🎮 ByteRushGameCanvas: Component mounted, initializing game...');
      try {
        initializeGame();
        console.log('🎮 ByteRushGameCanvas: Game initialized successfully');
        startGame();
        console.log('🎮 ByteRushGameCanvas: Game started successfully');
      } catch (error) {
        console.error('❌ ByteRushGameCanvas: Error initializing game:', error);
      }

      return () => {
        console.log('🎮 ByteRushGameCanvas: Component unmounting, stopping game...');
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
            imageRendering: 'pixelated'
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
              <div className="text-white text-2xl">Final Score: {gameState.score.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* BYTECLUB: Controls hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-400">
          <div>Arrow Keys to Move | P to Pause</div>
          <div className="mt-1">
            <span className="text-green-400">Green = +10pts</span> | {' '}
            <span className="text-red-400">Red = -1 Life</span> | {' '}
            <span className="text-blue-400">Blue = Powerup</span>
          </div>
        </div>
      </div>
    );
  }
);

ByteRushGameCanvas.displayName = 'ByteRushGameCanvas';
