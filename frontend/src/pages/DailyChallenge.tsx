import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Calendar, Flame, Zap, Clock } from "lucide-react";

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
            Daily Challenge
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-10 h-10 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Today's Challenge</h2>
                    <p className="text-muted-foreground">Complete before reset</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <Clock className="w-6 h-6" />
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground">Until next challenge</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">7</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">+250</div>
                    <div className="text-sm text-muted-foreground">Bonus XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">42</div>
                    <div className="text-sm text-muted-foreground">Days Total</div>
                  </div>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeonCard variant="violet" glow>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Binary Tree Traversal</h3>
                    <div className="flex gap-2">
                      <NeonBadge variant="hard">Hard</NeonBadge>
                      <NeonBadge variant="default">
                        <Zap className="w-3 h-3 mr-1" />
                        250 XP
                      </NeonBadge>
                      <NeonBadge variant="success">+50 Streak Bonus</NeonBadge>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    Implement an in-order traversal of a binary tree. The function should visit all nodes and return their values in sorted order.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>▸ Use recursive approach</li>
                    <li>▸ Handle edge cases (null nodes)</li>
                    <li>▸ Return array of values</li>
                    <li>▸ Time complexity: O(n)</li>
                  </ul>
                </div>

                <Button variant="cyber" size="lg" className="w-full" onClick={() => navigate("/challenge/daily")}>
                  <Zap className="mr-2 h-5 w-5" />
                  Start Challenge
                </Button>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeonCard variant="blue" glow>
              <h3 className="text-xl font-semibold mb-4">Streak Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Streak</span>
                  <span className="text-primary font-bold">7 days</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">3 more days to unlock Streak Master badge!</p>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-muted-foreground"
          >
            <p>"Consistency is the key to mastery"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
