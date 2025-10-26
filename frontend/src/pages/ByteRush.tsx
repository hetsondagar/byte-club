import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Play, Keyboard, Target, Zap, Heart, Shield, Rocket, Flame, Move } from 'lucide-react';

export default function ByteRush() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BYTECLUB: Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

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

  const handleStartGame = () => {
    navigate('/byte-rush/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/50 to-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* BYTECLUB: Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            🚀 Byte Rush
          </h1>
          <p className="text-xl text-muted-foreground font-mono mb-6">
            Top-down arcade shooter • Defeat waves of enemies • Achieve the highest score!
          </p>
          
          {/* BYTECLUB: Start Game Button */}
          <Button 
            size="lg" 
            onClick={handleStartGame}
            className="text-lg px-8 py-6 h-auto"
          >
            <Play className="mr-2 h-6 w-6" />
            Start Game
          </Button>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BYTECLUB: Left Column - Game Info */}
          <div className="space-y-6">
            {/* BYTECLUB: How to Play */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Move className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-semibold">Movement</p>
                      <p className="text-sm text-muted-foreground">
                        Use <kbd className="px-2 py-1 bg-background rounded border">A</kbd> or <kbd className="px-2 py-1 bg-background rounded border">←</kbd> to move left
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Use <kbd className="px-2 py-1 bg-background rounded border">D</kbd> or <kbd className="px-2 py-1 bg-background rounded border">→</kbd> to move right
                      </p>
        </div>
      </div>

                  <div className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Shooting</p>
                      <p className="text-sm text-muted-foreground">
                        Hold <kbd className="px-2 py-1 bg-background rounded border">Space</kbd> to continuously shoot bullets
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Keep spacebar pressed to fire rapidly!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-semibold">Objective</p>
                      <p className="text-sm text-muted-foreground">
                        Destroy enemies to score points and collect power-ups
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avoid enemy collisions - you have 3 lives!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BYTECLUB: Enemy Types */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  Enemy Ships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-cyan-500/30">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded flex items-center justify-center">
                    <span className="text-2xl">👾</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-cyan-400">Normal Enemy</p>
                    <p className="text-sm text-muted-foreground">Standard speed • <span className="text-primary font-bold">10 points</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-yellow-500/30">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-400">Fast Enemy</p>
                    <p className="text-sm text-muted-foreground">High speed • <span className="text-primary font-bold">20 points</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-red-500/30">
                  <div className="w-12 h-12 bg-red-500/20 rounded flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">Tank Enemy</p>
                    <p className="text-sm text-muted-foreground">High health • <span className="text-primary font-bold">50 points</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-green-500/30">
                  <div className="w-12 h-12 bg-green-500/20 rounded flex items-center justify-center">
                    <span className="text-2xl">💫</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-400">Zigzag Enemy</p>
                    <p className="text-sm text-muted-foreground">Zigzag pattern • <span className="text-primary font-bold">30 points</span></p>
                  </div>
              </div>
              </CardContent>
            </Card>

            {/* BYTECLUB: Power-Ups */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Power-Ups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-semibold">Extra Life</p>
                    <p className="text-sm text-muted-foreground">Gain an additional life</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-semibold">Rapid Fire</p>
                    <p className="text-sm text-muted-foreground">Increase bullet fire rate</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">Shield</p>
                    <p className="text-sm text-muted-foreground">Temporary invincibility</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BYTECLUB: Right Column - Leaderboard */}
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
      </div>
    </div>
  );
}
