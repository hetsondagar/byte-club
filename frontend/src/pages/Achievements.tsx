import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Award, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

const achievements: Achievement[] = [
  { id: 1, name: "First Steps", description: "Complete your first challenge", icon: "🎯", unlocked: true },
  { id: 2, name: "Loop Lord", description: "Master 10 loop challenges", icon: "🔄", unlocked: true },
  { id: 3, name: "Syntax Slayer", description: "Fix 25 syntax errors", icon: "⚔️", unlocked: true },
  { id: 4, name: "Speed Demon", description: "Complete 5 challenges in under 5 minutes", icon: "⚡", unlocked: true },
  { id: 5, name: "Array Ace", description: "Master all array challenges", icon: "📊", unlocked: false, progress: { current: 8, total: 15 } },
  { id: 6, name: "Function Fury", description: "Write 50 functions", icon: "⚙️", unlocked: false, progress: { current: 32, total: 50 } },
  { id: 7, name: "Recursion Master", description: "Solve 10 recursion problems", icon: "♾️", unlocked: false, progress: { current: 3, total: 10 } },
  { id: 8, name: "Bug Exterminator", description: "Debug 100 code snippets", icon: "🐛", unlocked: false, progress: { current: 45, total: 100 } },
  { id: 9, name: "Streak Keeper", description: "Maintain a 30-day streak", icon: "🔥", unlocked: false, progress: { current: 7, total: 30 } },
];

export default function Achievements() {
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
            Achievements
          </h1>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Your Progress</h2>
                    <p className="text-muted-foreground">4 / 9 achievements unlocked</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">44%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <NeonCard
                          variant={achievement.unlocked ? "cyan" : "default"}
                          glow={achievement.unlocked}
                          className={`relative overflow-hidden ${!achievement.unlocked ? "opacity-60" : ""}`}
                        >
                          <div className="text-center space-y-3">
                            <motion.div
                              className="text-5xl"
                              animate={achievement.unlocked ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {achievement.unlocked ? achievement.icon : <Lock className="w-12 h-12 mx-auto text-muted-foreground" />}
                            </motion.div>
                            <div>
                              <h3 className="font-bold text-lg">{achievement.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                            </div>
                            {!achievement.unlocked && achievement.progress && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{achievement.progress.current}</span>
                                  <span>{achievement.progress.total}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {achievement.unlocked && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </NeonCard>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{achievement.name}</p>
                      <p className="text-xs">{achievement.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 text-muted-foreground"
          >
            <p>"Loop Lord unlocked! Keep hacking."</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
