import { useState, useEffect } from 'react';
import { useByteRushGame } from '../hooks/useByteRushGame';
import { ByteRushCanvas } from '../components/ByteRushCanvas';
import { apiService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Play, Pause, RotateCcw, Zap, Heart, Shield } from 'lucide-react';

export default function ByteRush() {
  const { gameState, player, bullets, enemies, powerUps, particles, startGame, pauseGame, GAME_CONFIG } = useByteRushGame();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // BYTECLUB: Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // BYTECLUB: Submit score on game over
  useEffect(() => {
    if (gameState.gameOver && gameState.score > 0) {
      submitScore();
    }
  }, [gameState.gameOver, gameState.score]);

  const fetchLeaderboard = async () => {
    try {
      const data = await apiService.getByteRushLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async () => {
    try {
      setSubmitting(true);
      await apiService.submitByteRushScore({
        score: gameState.score,
        wave: gameState.wave,
        enemiesKilled: gameState.enemiesKilled
      });
      await fetchLeaderboard(); // Refresh leaderboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/50 to-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* BYTECLUB: Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            🎮 Byte Rush
          </h1>
          <p className="text-lg text-muted-foreground font-mono">
            Top-down arcade shooter • Defeat waves of enemies • Achieve the highest score!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BYTECLUB: Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Game
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={gameState.isPlaying ? handlePauseResume : handleStartGame}
                      disabled={submitting}
                    >
                      {gameState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {gameState.isPlaying ? 'Pause' : 'Start'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestart}
                      disabled={!gameState.isPlaying && !gameState.gameOver}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restart
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* BYTECLUB: Game Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Score</div>
                    <div className="text-2xl font-bold text-primary">{gameState.score}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-secondary/10">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Wave</div>
                    <div className="text-2xl font-bold text-secondary">{gameState.wave}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-accent/10">
                    <div className="text-xs text-muted-foreground font-mono mb-1 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Lives
                    </div>
                    <div className="text-2xl font-bold text-accent">{gameState.lives}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Kills</div>
                    <div className="text-2xl font-bold text-primary">{gameState.enemiesKilled}</div>
                  </div>
                </div>

                {/* BYTECLUB: Game Canvas */}
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
                    <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
                      <div className="text-center p-8 bg-card rounded-lg border-2 border-primary">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
                        <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
                        <p className="text-xl text-muted-foreground mb-4">
                          Final Score: <span className="text-primary font-bold">{gameState.score}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Wave {gameState.wave} • {gameState.enemiesKilled} Enemies Destroyed
                        </p>
                        {submitting && (
                          <p className="text-sm text-primary mb-4">Submitting score...</p>
                        )}
                        <Button onClick={handleStartGame} disabled={submitting}>
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* BYTECLUB: Paused Overlay */}
                  {gameState.isPaused && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <div className="text-center p-8 bg-card rounded-lg border-2 border-secondary">
                        <Pause className="h-16 w-16 mx-auto mb-4 text-secondary" />
                        <h2 className="text-4xl font-bold mb-4">Paused</h2>
                        <Button onClick={handlePauseResume}>Resume</Button>
                      </div>
                    </div>
                  )}

                  {/* BYTECLUB: Instructions Overlay */}
                  {!gameState.isPlaying && !gameState.gameOver && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <div className="text-center p-8 bg-card rounded-lg border-2 border-accent max-w-md">
                        <Play className="h-16 w-16 mx-auto mb-4 text-accent" />
                        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
                        <div className="text-left space-y-2 text-sm text-muted-foreground mb-6">
                          <p><strong>Controls:</strong></p>
                          <p>• <kbd className="px-2 py-1 bg-background rounded">A</kbd> or <kbd className="px-2 py-1 bg-background rounded">←</kbd> - Move Left</p>
                          <p>• <kbd className="px-2 py-1 bg-background rounded">D</kbd> or <kbd className="px-2 py-1 bg-background rounded">→</kbd> - Move Right</p>
                          <p>• <kbd className="px-2 py-1 bg-background rounded">Space</kbd> - Shoot</p>
                          <p className="mt-4"><strong>Enemy Types:</strong></p>
                          <p>• <span className="text-[#4ecdc4]">Cyan</span> - Normal (10 pts)</p>
                          <p>• <span className="text-[#ffd93d]">Yellow</span> - Fast (20 pts)</p>
                          <p>• <span className="text-[#ff6b6b]">Red</span> - Tank (50 pts)</p>
                          <p>• <span className="text-[#a8e6cf]">Green</span> - Zigzag (30 pts)</p>
                        </div>
                        <Button onClick={handleStartGame} size="lg">
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BYTECLUB: Leaderboard */}
          <div>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scores yet!</p>
                    <p className="text-sm">Be the first to play!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          index === 0
                            ? 'bg-primary/10 border-primary'
                            : index === 1
                            ? 'bg-secondary/10 border-secondary'
                            : index === 2
                            ? 'bg-accent/10 border-accent'
                            : 'bg-background/50 border-primary/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold w-8">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                          </span>
                          <div>
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-xs text-muted-foreground">
                              Wave {entry.wave} • {entry.enemiesKilled} kills
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{entry.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BYTECLUB: Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground font-mono">
          <p>Byte Rush • A Byte Club Arcade Experience</p>
          <p className="mt-1">Survive as long as possible and climb the leaderboard!</p>
        </div>
      </div>
    </div>
  );
}
