import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeHeistCard, CardBack } from '@/components/CodeHeistCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCodeHeist } from '@/contexts/CodeHeistContext';
import { Card, Player } from '@/types/codeHeist';
import { Heart, Send, ArrowRight, Trophy, Users, MessageCircle, Scroll } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CodeHeistGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, gameLog, chatMessages, drawCard, playCard, endTurn, sendChatMessage, leaveRoom } = useCodeHeist();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showLog, setShowLog] = useState(true);
  
  const logRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !currentRoom) {
      navigate('/code-heist/lobby');
      return;
    }

    if (currentRoom.gameState === 'ended') {
      // Game ended, show winner
      setTimeout(() => {
        navigate('/code-heist/lobby');
      }, 5000);
    }
  }, [user, currentRoom, navigate]);

  useEffect(() => {
    // Auto-scroll log
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLog]);

  useEffect(() => {
    // Auto-scroll chat
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!currentRoom || !user) {
    return null;
  }

  const currentPlayer = currentRoom.players[currentRoom.currentPlayerIndex];
  const myPlayer = currentRoom.players.find((p: Player) => p.userId === user._id);
  const isMyTurn = currentPlayer?.userId === user._id;
  const otherPlayers = currentRoom.players.filter((p: Player) => p.userId !== user._id);

  const handleDrawCard = async () => {
    try {
      await drawCard();
      setSelectedCard(null);
    } catch (error) {
      console.error('Draw card error:', error);
    }
  };

  const handlePlayCard = async () => {
    if (!selectedCard) {
      toast.error('Select a card to play');
      return;
    }

    try {
      await playCard(selectedCard.name, selectedTargetPlayer || undefined);
      setSelectedCard(null);
      setSelectedTargetPlayer(null);
    } catch (error) {
      console.error('Play card error:', error);
    }
  };

  const handleEndTurn = async () => {
    try {
      await endTurn();
      setSelectedCard(null);
      setSelectedTargetPlayer(null);
    } catch (error) {
      console.error('End turn error:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const handleLeaveGame = async () => {
    if (confirm('Are you sure you want to leave the game?')) {
      try {
        await leaveRoom();
        navigate('/code-heist');
      } catch (error) {
        console.error('Leave game error:', error);
      }
    }
  };

  // Game ended state
  if (currentRoom.gameState === 'ended') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <FloatingParticles count={50} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl mx-auto px-4"
        >
          <NeonCard variant="violet" glow>
            <div className="text-center py-12">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Game Over!
              </h1>
              {currentRoom.winner && (
                <p className="text-2xl text-muted-foreground mb-8">
                  🏆 <span className="text-yellow-400 font-bold">{currentRoom.winner}</span> wins!
                </p>
              )}
              <Button 
                size="lg"
                onClick={() => navigate('/code-heist/lobby')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
              >
                Return to Lobby
              </Button>
            </div>
          </NeonCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <FloatingParticles count={30} />
      
      <div className="relative z-10 h-screen flex flex-col p-4">
        {/* Top Bar - Room Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLeaveGame}>
              Leave Game
            </Button>
            <div className="text-sm">
              <span className="text-muted-foreground">Room:</span>{' '}
              <span className="font-bold">{currentRoom.roomCode}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Turn {currentRoom.turnNumber}</div>
            <div className="text-lg font-bold text-cyan-400">
              {isMyTurn ? "YOUR TURN" : `${currentPlayer.username}'s Turn`}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {currentRoom.players.filter((p: Player) => p.isActive).length}/{currentRoom.players.length}
            </div>
            <div className="text-muted-foreground">
              Deck: {currentRoom.deck.length}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
          {/* Left Sidebar - Game Log */}
          <div className="col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLog(!showLog)}
                className="gap-2"
              >
                <Scroll className="w-4 h-4" />
                Game Log
              </Button>
            </div>
            
            {showLog && (
              <NeonCard variant="cyan" className="flex-1 overflow-hidden">
                <div ref={logRef} className="h-full overflow-y-auto space-y-2 pr-2">
                  {gameLog.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'text-sm p-2 rounded border-l-4',
                        log.type === 'system' && 'border-blue-500 bg-blue-500/10',
                        log.type === 'action' && 'border-cyan-500 bg-cyan-500/10',
                        log.type === 'attack' && 'border-red-500 bg-red-500/10',
                        log.type === 'defense' && 'border-green-500 bg-green-500/10'
                      )}
                    >
                      {log.message}
                    </motion.div>
                  ))}
                </div>
              </NeonCard>
            )}
          </div>

          {/* Center - Game Board */}
          <div className="col-span-6 flex flex-col">
            {/* Other Players */}
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4">
                {otherPlayers.map((player: Player) => (
                  <motion.div
                    key={player.userId}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedTargetPlayer(player.userId)}
                  >
                    <NeonCard 
                      variant={currentPlayer.userId === player.userId ? 'violet' : 'blue'}
                      glow={currentPlayer.userId === player.userId}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedTargetPlayer === player.userId && 'ring-2 ring-yellow-400',
                        !player.isActive && 'opacity-50'
                      )}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-lg mx-auto mb-2">
                          {player.username[0].toUpperCase()}
                        </div>
                        <p className="font-bold text-sm mb-1">{player.username}</p>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {Array.from({ length: player.lives }).map((_, i) => (
                            <Heart key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {player.hand.map((_, i) => (
                            <CardBack key={i} size="small" />
                          ))}
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center Table - Deck and Discard */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-8">
                {/* Deck */}
                <div className="text-center">
                  <div className="mb-2">
                    <div className="relative w-32 h-48">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="absolute"
                          style={{ 
                            top: `${i * 2}px`, 
                            left: `${i * 2}px`,
                            zIndex: 3 - i
                          }}
                        >
                          <CardBack size="medium" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Deck ({currentRoom.deck.length})
                  </p>
                </div>

                {/* Discard Pile */}
                <div className="text-center">
                  <div className="mb-2">
                    {currentRoom.discardPile.length > 0 ? (
                      <CodeHeistCard
                        card={currentRoom.discardPile[currentRoom.discardPile.length - 1]}
                        size="medium"
                        disabled
                      />
                    ) : (
                      <div className="w-32 h-48 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-muted-foreground text-sm">
                        Empty
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Discard ({currentRoom.discardPile.length})
                  </p>
                </div>
              </div>
            </div>

            {/* My Hand */}
            {myPlayer && (
              <div className="mt-4">
                <NeonCard variant="cyan" glow={isMyTurn}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold">
                        {myPlayer.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold">{myPlayer.username} (You)</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: myPlayer.lives }).map((_, i) => (
                            <Heart key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {isMyTurn && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={handleDrawCard}
                          disabled={myPlayer.hand.length >= 2}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Draw Card
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handlePlayCard}
                          disabled={!selectedCard}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Play Card
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleEndTurn}
                          variant="outline"
                        >
                          End Turn
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    {myPlayer.hand.length > 0 ? (
                      myPlayer.hand.map((card: Card, index: number) => (
                        <CodeHeistCard
                          key={index}
                          card={card}
                          size="medium"
                          selected={selectedCard?.name === card.name}
                          disabled={!isMyTurn}
                          onClick={() => setSelectedCard(card)}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground py-8">No cards in hand - draw a card!</p>
                    )}
                  </div>
                </NeonCard>
              </div>
            )}
          </div>

          {/* Right Sidebar - Chat */}
          <div className="col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
            </div>
            
            {showChat && (
              <NeonCard variant="violet" className="flex-1 flex flex-col overflow-hidden">
                <div ref={chatRef} className="flex-1 overflow-y-auto space-y-2 pr-2 mb-3">
                  {chatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm"
                    >
                      <span className="font-bold text-cyan-400">{msg.username}:</span>{' '}
                      <span className="text-muted-foreground">{msg.message}</span>
                    </motion.div>
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    maxLength={200}
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </NeonCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

