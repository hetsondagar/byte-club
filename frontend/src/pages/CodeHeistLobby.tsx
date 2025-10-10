import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCodeHeist } from '@/contexts/CodeHeistContext';
import { Users, Copy, Check, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Player } from '@/types/codeHeist';

export default function CodeHeistLobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, currentRoom, toggleReady, startGame, leaveRoom } = useCodeHeist();
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!connected) {
      toast.error('Not connected to game server');
    }
  }, [user, connected, navigate]);

  useEffect(() => {
    if (currentRoom && currentRoom.gameState === 'playing') {
      navigate('/code-heist/game');
    }
  }, [currentRoom, navigate]);

  const handleCopyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.roomCode);
      setCopied(true);
      toast.success('Room code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    try {
      await toggleReady();
    } catch (error) {
      console.error('Toggle ready error:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (error) {
      console.error('Start game error:', error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      navigate('/code-heist');
    } catch (error) {
      console.error('Leave room error:', error);
    }
  };

  if (!currentRoom) {
    return <CodeHeistLobbyCreate />;
  }

  const currentPlayer = currentRoom.players.find((p: Player) => p.userId === user?._id);
  const isHost = currentRoom.hostId === user?._id;
  const allReady = currentRoom.players.every((p: Player) => p.isReady || p.userId === currentRoom.hostId);
  const canStart = currentRoom.players.length >= 3 && allReady;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />
      
      <Navbar 
        username={user?.username || 'Hacker'} 
        level={user?.currentLevel || 1} 
        xp={user?.totalXP || 0} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={handleLeaveRoom}>
              <ArrowLeft className="mr-2" />
              Leave Room
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {currentRoom.roomName}
              </h1>
            </div>

            <div className="w-32" /> {/* Spacer for centering */}
          </div>

          {/* Room Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Room Code</p>
                  <p className="text-3xl font-bold tracking-wider text-cyan-400">{currentRoom.roomCode}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleCopyRoomCode}
                  className="border-cyan-500 hover:bg-cyan-500/20"
                >
                  {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </NeonCard>
          </motion.div>

          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <NeonCard variant="violet" glow>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentRoom.players.length < 3 ? 'Need at least 3 players' : 'Ready to start!'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRoom.players.map((player: Player) => (
                  <div
                    key={player.userId}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      player.isReady || player.userId === currentRoom.hostId
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xl">
                          {player.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {player.username}
                            {player.userId === currentRoom.hostId && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500 rounded text-xs text-yellow-400">
                                HOST
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {player.isReady || player.userId === currentRoom.hostId ? (
                              <span className="text-green-400">✓ Ready</span>
                            ) : (
                              <span className="text-yellow-400">Waiting...</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="p-4 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/30 flex items-center justify-center"
                  >
                    <p className="text-muted-foreground">Waiting for player...</p>
                  </div>
                ))}
              </div>
            </NeonCard>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeonCard variant="blue">
              <div className="flex items-center justify-between gap-4">
                {!isHost && currentPlayer && (
                  <Button 
                    size="lg" 
                    variant={currentPlayer.isReady ? 'outline' : 'default'}
                    onClick={handleToggleReady}
                    className="flex-1"
                  >
                    {currentPlayer.isReady ? 'Not Ready' : 'Ready!'}
                  </Button>
                )}

                {isHost && (
                  <>
                    <div className="flex-1">
                      {!canStart && (
                        <p className="text-yellow-400 text-sm">
                          {currentRoom.players.length < 3 
                            ? `Need ${3 - currentRoom.players.length} more player(s)`
                            : 'Waiting for all players to be ready...'}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="lg" 
                      disabled={!canStart}
                      onClick={handleStartGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8"
                    >
                      Start Game
                    </Button>
                  </>
                )}
              </div>
            </NeonCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Create/Join Room Component
function CodeHeistLobbyCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, createRoom, joinRoom } = useCodeHeist();
  
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      await createRoom(roomName, maxPlayers);
    } catch (error) {
      console.error('Create room error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      await joinRoom(roomCode.toUpperCase());
    } catch (error) {
      console.error('Join room error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />
      
      <Navbar 
        username={user?.username || 'Hacker'} 
        level={user?.currentLevel || 1} 
        xp={user?.totalXP || 0} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => navigate('/code-heist')}>
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-8">
            {mode === 'menu' ? 'Game Lobby' : mode === 'create' ? 'Create Room' : 'Join Room'}
          </h1>

          {!connected && (
            <NeonCard variant="cyan" className="mb-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <p>Connecting to game server...</p>
              </div>
            </NeonCard>
          )}

          {mode === 'menu' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <NeonCard variant="cyan" glow>
                <Button 
                  size="lg" 
                  className="w-full text-lg py-8"
                  onClick={() => setMode('create')}
                  disabled={!connected}
                >
                  Create New Room
                </Button>
              </NeonCard>

              <NeonCard variant="violet" glow>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full text-lg py-8 border-purple-500 hover:bg-purple-500/20"
                  onClick={() => setMode('join')}
                  disabled={!connected}
                >
                  Join Existing Room
                </Button>
              </NeonCard>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <NeonCard variant="cyan" glow>
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                      className="mt-2"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <select
                      id="maxPlayers"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="mt-2 w-full px-3 py-2 bg-background border border-input rounded-md"
                    >
                      <option value={3}>3 Players</option>
                      <option value={4}>4 Players</option>
                      <option value={5}>5 Players</option>
                      <option value={6}>6 Players</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setMode('menu')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Room
                    </Button>
                  </div>
                </form>
              </NeonCard>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <NeonCard variant="violet" glow>
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div>
                    <Label htmlFor="roomCode">Room Code</Label>
                    <Input
                      id="roomCode"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code..."
                      className="mt-2 text-2xl tracking-widest text-center"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setMode('menu')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Join Room
                    </Button>
                  </div>
                </form>
              </NeonCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

