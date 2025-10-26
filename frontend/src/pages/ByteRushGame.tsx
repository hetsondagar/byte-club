import { useState, useEffect } from 'react';
import { useByteRushGame } from '../hooks/useByteRushGame';
import { ByteRushCanvas } from '../components/ByteRushCanvas';
import { apiService } from '../services/api';
import { Button } from '../components/ui/button';
import { Trophy, Play, Pause, RotateCcw, Home, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ByteRushGame() {
  const navigate = useNavigate();
  const { gameState, player, bullets, enemies, powerUps, particles, startGame, pauseGame, GAME_CONFIG } = useByteRushGame();
  
  const [submitting, setSubmitting] = useState(false);

  // BYTECLUB: Submit score on game over
  useEffect(() => {
    if (gameState.gameOver && gameState.score > 0) {
      submitScore();
    }
  }, [gameState.gameOver, gameState.score]);

  const submitScore = async () => {
    try {
      setSubmitting(true);
      await apiService.submitByteRushScore({
        score: gameState.score,
        wave: gameState.wave,
        enemiesKilled: gameState.enemiesKilled
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartGame = () => {
    startGame();
  };

  const handlePauseResume = () => {
    pauseGame();
  };

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart? Your current score will be lost!')) {
      startGame();
    }
  };

  const handleBackToMain = () => {
    navigate('/byte-rush');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      {/* BYTECLUB: Game Stats HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="bg-black/80 rounded-lg p-3 border border-primary/30">
            <div className="text-xs text-muted-foreground font-mono mb-1">Score</div>
            <div className="text-2xl font-bold text-primary">{gameState.score}</div>
          </div>
          <div className="bg-black/80 rounded-lg p-3 border border-secondary/30">
            <div className="text-xs text-muted-foreground font-mono mb-1">Wave</div>
            <div className="text-2xl font-bold text-secondary">{gameState.wave}</div>
          </div>
          <div className="bg-black/80 rounded-lg p-3 border border-accent/30">
            <div className="text-xs text-muted-foreground font-mono mb-1 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Lives
            </div>
            <div className="text-2xl font-bold text-accent">{gameState.lives}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToMain}
            className="bg-black/80 border-primary/30"
          >
            <Home className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseResume}
            disabled={submitting || !gameState.isPlaying && !gameState.gameOver}
            className="bg-black/80 border-primary/30"
          >
            {gameState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {gameState.isPlaying ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={!gameState.isPlaying && !gameState.gameOver}
            className="bg-black/80 border-primary/30"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      {/* BYTECLUB: Game Canvas - Fullscreen */}
      <div className="relative">
        <ByteRushCanvas
          player={player}
          bullets={bullets}
          enemies={enemies}
          powerUps={powerUps}
          particles={particles}
          gameConfig={GAME_CONFIG}
        />

        {/* BYTECLUB: Game Over Overlay */}
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-center p-12 bg-black/95 rounded-lg border-2 border-primary w-full max-w-md">
              <Trophy className="h-20 w-20 mx-auto mb-6 text-primary animate-bounce" />
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Game Over!
              </h2>
              <p className="text-2xl text-muted-foreground mb-2">
                Final Score: <span className="text-primary font-bold">{gameState.score}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Wave {gameState.wave} • {gameState.enemiesKilled} Enemies Destroyed
              </p>
              {submitting && (
                <p className="text-sm text-primary mb-4">Submitting score...</p>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleStartGame} disabled={submitting} size="lg" className="px-8">
                  <Zap className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
                <Button onClick={handleBackToMain} variant="outline" size="lg" className="px-8">
                  <Home className="mr-2 h-5 w-5" />
                  Main Menu
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* BYTECLUB: Paused Overlay */}
        {gameState.isPaused && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center p-12 bg-black/90 rounded-lg border-2 border-secondary w-full max-w-md">
              <Pause className="h-20 w-20 mx-auto mb-6 text-secondary animate-pulse" />
              <h2 className="text-5xl font-bold mb-8">Paused</h2>
              <Button onClick={handlePauseResume} size="lg" className="px-8">
                <Play className="mr-2 h-5 w-5" />
                Resume
              </Button>
            </div>
          </div>
        )}

        {/* BYTECLUB: Start Screen Overlay */}
        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-center p-12 bg-black/95 rounded-lg border-2 border-accent w-full max-w-lg">
              <Zap className="h-20 w-20 mx-auto mb-6 text-accent animate-pulse" />
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Ready to Play?
              </h2>
              <div className="text-left space-y-3 text-sm text-muted-foreground mb-8 bg-black/50 p-6 rounded-lg">
                <p className="font-semibold text-white mb-3">Controls:</p>
                <p>• <kbd className="px-2 py-1 bg-black rounded border border-primary/30">A</kbd> or <kbd className="px-2 py-1 bg-black rounded border border-primary/30">←</kbd> - Move Left</p>
                <p>• <kbd className="px-2 py-1 bg-black rounded border border-primary/30">D</kbd> or <kbd className="px-2 py-1 bg-black rounded border border-primary/30">→</kbd> - Move Right</p>
                <p>• <kbd className="px-2 py-1 bg-black rounded border border-primary/30">Space</kbd> - Shoot (Hold for continuous fire)</p>
                <p className="pt-3 border-t border-primary/30">• You have <span className="text-accent font-bold">3 lives</span></p>
                <p>• Destroy enemies to score points</p>
                <p>• Collect power-ups for special abilities</p>
              </div>
              <Button onClick={handleStartGame} size="lg" className="px-12">
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
