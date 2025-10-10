import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { CodeHeistCard } from '@/components/CodeHeistCard';
import { CARD_DEFINITIONS } from '@/types/codeHeist';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Users, Trophy, Zap, Shield, Crosshair, ArrowRight } from 'lucide-react';

export default function CodeHeist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: '3-6 Players',
      description: 'Multiplayer mayhem with real-time gameplay'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast-Paced',
      description: 'Quick rounds with strategic depth'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Defense & Attack',
      description: 'Protect yourself while sabotaging others'
    },
    {
      icon: <Crosshair className="w-8 h-8" />,
      title: 'Bluff & Deduce',
      description: 'Outsmart opponents with mind games'
    }
  ];

  const gameFlow = [
    { step: 1, title: 'Draw Phase', description: 'Draw 1 card from the deck' },
    { step: 2, title: 'Play Phase', description: 'Play 1 card and resolve its effect' },
    { step: 3, title: 'Resolution', description: 'Effects trigger, attacks resolve' },
    { step: 4, title: 'End Turn', description: 'Pass turn to next player' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={30} />
      
      <Navbar 
        username={user?.username || 'Hacker'} 
        level={user?.currentLevel || 1} 
        xp={user?.totalXP || 0} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gamepad2 className="w-20 h-20 text-primary mx-auto" />
          </motion.div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            CODE HEIST
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A cyberpunk card game where hackers battle to deliver the Master Algorithm while sabotaging their rivals.
            Bluff, attack, defend, and outsmart your opponents to be the last coder standing!
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg px-8"
              onClick={() => navigate('/code-heist/lobby')}
            >
              Start New Game
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20 text-lg px-8"
              onClick={() => navigate('/code-heist/join')}
            >
              Join Game
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <NeonCard variant="cyan" glow className="text-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-primary">{feature.icon}</div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Game Objective */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <NeonCard variant="violet" glow>
            <div className="flex items-start gap-4">
              <Trophy className="w-12 h-12 text-yellow-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-3">Objective</h2>
                <p className="text-lg text-muted-foreground">
                  Be the <span className="text-yellow-400 font-bold">last hacker standing</span> by protecting your life tokens 
                  while eliminating opponents through strategic card plays. Use attacks, defenses, and mind games to survive!
                </p>
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Card Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Card Arsenal</h2>
          
          <div className="flex justify-center mb-6">
            <div className="flex gap-2 overflow-x-auto pb-4">
              {CARD_DEFINITIONS.map((card, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCardIndex(index)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedCardIndex === index
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <CodeHeistCard
              card={CARD_DEFINITIONS[selectedCardIndex]}
              size="large"
            />
          </div>
        </motion.div>

        {/* Game Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">How to Play</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameFlow.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <NeonCard variant="blue">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {phase.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{phase.title}</h3>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rules Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <NeonCard variant="cyan" glow>
            <h2 className="text-3xl font-bold mb-6">Key Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 text-sm">✓</div>
                  <p className="text-muted-foreground">Each player starts with 1-2 life tokens</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 text-sm">✓</div>
                  <p className="text-muted-foreground">Maximum 2 cards in hand at once</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 text-sm">✓</div>
                  <p className="text-muted-foreground">Encryption Key required for System Override & Botnet</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-sm">!</div>
                  <p className="text-muted-foreground">Losing Master Algorithm = instant elimination</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-sm">!</div>
                  <p className="text-muted-foreground">When deck is empty, shuffle discard pile</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 text-sm">!</div>
                  <p className="text-muted-foreground">Last player standing wins the game</p>
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <NeonCard variant="violet" glow>
            <div className="py-8">
              <h2 className="text-4xl font-bold mb-4">Ready to Hack?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join the cyberpunk card game revolution now!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8"
                  onClick={() => navigate('/code-heist/lobby')}
                >
                  Create Room
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-lg px-8"
                  onClick={() => navigate('/code-heist/leaderboard')}
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </NeonCard>
        </motion.div>
      </div>
    </div>
  );
}

