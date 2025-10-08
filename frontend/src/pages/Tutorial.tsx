import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Map, Trophy, Zap, Award, BookOpen } from "lucide-react";

const tutorialSteps = [
  {
    title: "Adventure Map",
    icon: Map,
    description: "Navigate through interconnected challenge nodes in the Adventure Map. Each node represents a unique coding challenge.",
    tips: [
      "Complete nodes to unlock new paths",
      "Nodes glow cyan when available",
      "Locked nodes require prerequisites",
    ],
  },
  {
    title: "XP & Levels",
    icon: Zap,
    description: "Earn XP by completing challenges. Level up to unlock advanced content and special badges.",
    tips: [
      "Harder challenges give more XP",
      "XP contributes to your leaderboard rank",
      "Track progress with the XP bar",
    ],
  },
  {
    title: "Badges & Achievements",
    icon: Award,
    description: "Unlock badges by reaching milestones. Collect them all to prove your mastery!",
    tips: [
      "Some badges require streaks",
      "Hidden achievements exist",
      "Display your favorite badges",
    ],
  },
  {
    title: "Challenge Types",
    icon: BookOpen,
    description: "Face various challenge formats: coding problems, MCQs, true/false, and debugging tasks.",
    tips: [
      "Read descriptions carefully",
      "Don't fear the semicolon!",
      "Submit when confident",
    ],
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    description: "Compete with fellow hackers. Weekly, monthly, and all-time rankings available.",
    tips: [
      "Top 3 get special recognition",
      "Consistency beats bursts",
      "Climb the ranks steadily",
    ],
  },
];

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tutorial
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <h2 className="text-2xl font-bold mb-4">Welcome to Byte Club</h2>
              <p className="text-muted-foreground">
                Master coding through gamified challenges. This tutorial will guide you through the platform's core features.
              </p>
            </NeonCard>
          </motion.div>

          {tutorialSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <NeonCard
                  variant={index % 3 === 0 ? "cyan" : index % 3 === 1 ? "violet" : "blue"}
                  glow
                >
                  <div className="flex gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg self-start">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-center gap-2 text-sm">
                            <span className="text-primary">▸</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </NeonCard>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Start?</h3>
                <p className="text-muted-foreground">Jump into the Adventure Map and begin your journey!</p>
                <Button variant="cyber" size="lg" onClick={() => navigate("/adventure-map")}>
                  <Map className="mr-2 h-5 w-5" />
                  Start Adventure
                </Button>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-muted-foreground text-sm"
          >
            <p>"Don't fear the semicolon!"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
