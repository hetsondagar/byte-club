import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Scroll, Lock, CheckCircle, Zap } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  description: string;
  story: string;
  missions: number;
  completed: number;
  xpReward: number;
  unlocked: boolean;
}

const quests: Quest[] = [
  {
    id: 1,
    title: "The Beginning",
    description: "Learn the basics of programming",
    story: "Every hacker starts somewhere. Master the fundamentals to unlock your true potential.",
    missions: 5,
    completed: 5,
    xpReward: 500,
    unlocked: true,
  },
  {
    id: 2,
    title: "Loop Dimension",
    description: "Master iteration and loops",
    story: "Enter the infinite realm where patterns repeat. Break the cycle to move forward.",
    missions: 8,
    completed: 3,
    xpReward: 800,
    unlocked: true,
  },
  {
    id: 3,
    title: "Function Fortress",
    description: "Build reusable code blocks",
    story: "The fortress holds the secrets of modular code. Each function is a key to unlock new powers.",
    missions: 10,
    completed: 0,
    xpReward: 1000,
    unlocked: true,
  },
  {
    id: 4,
    title: "Array Abyss",
    description: "Navigate data structures",
    story: "Dive deep into the structured void. Organize data or be lost in chaos forever.",
    missions: 12,
    completed: 0,
    xpReward: 1200,
    unlocked: false,
  },
  {
    id: 5,
    title: "Recursive Realm",
    description: "Master the art of recursion",
    story: "A dimension that calls itself. Enter only if you dare to face infinite reflections.",
    missions: 15,
    completed: 0,
    xpReward: 1500,
    unlocked: false,
  },
];

export default function Quests() {
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quest Lines
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center gap-4">
                <Scroll className="w-10 h-10 text-primary" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Story Missions</h2>
                  <p className="text-muted-foreground">Follow the path through the code realm</p>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          {quests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <NeonCard
                variant={quest.completed === quest.missions ? "cyan" : quest.unlocked ? "violet" : "default"}
                glow={quest.unlocked}
                className={!quest.unlocked ? "opacity-60" : ""}
              >
                <div className="flex gap-6">
                  <div className="p-4 bg-primary/10 rounded-lg self-start">
                    {quest.completed === quest.missions ? (
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    ) : quest.unlocked ? (
                      <Scroll className="w-12 h-12 text-primary" />
                    ) : (
                      <Lock className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{quest.title}</h3>
                        {quest.completed === quest.missions && (
                          <NeonBadge variant="success">✓ Completed</NeonBadge>
                        )}
                      </div>
                      <p className="text-lg text-primary mb-2">{quest.description}</p>
                      <p className="text-sm text-muted-foreground italic">"{quest.story}"</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress: {quest.completed}/{quest.missions} missions
                        </span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-bold text-primary">{quest.xpReward} XP</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${(quest.completed / quest.missions) * 100}%` }}
                        />
                      </div>
                    </div>

                    {quest.unlocked && quest.completed < quest.missions && (
                      <Button variant="neon" onClick={() => navigate(`/quest/${quest.id}`)}>
                        {quest.completed === 0 ? "Begin Quest" : "Continue Quest"}
                      </Button>
                    )}
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground"
          >
            <p>"Hack through the mainframe, mission by mission"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
