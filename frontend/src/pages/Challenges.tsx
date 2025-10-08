import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Zap } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  completed: boolean;
  description: string;
}

const challenges: Challenge[] = [
  { id: 1, title: "Hello World Debug", difficulty: "easy", xp: 50, completed: true, description: "Fix the syntax error" },
  { id: 2, title: "Array Reversal", difficulty: "easy", xp: 75, completed: false, description: "Reverse an array without built-in methods" },
  { id: 3, title: "Palindrome Checker", difficulty: "medium", xp: 150, completed: false, description: "Check if a string is a palindrome" },
  { id: 4, title: "Binary Search", difficulty: "medium", xp: 200, completed: false, description: "Implement binary search algorithm" },
  { id: 5, title: "Dynamic Programming", difficulty: "hard", xp: 350, completed: false, description: "Solve the knapsack problem" },
  { id: 6, title: "Tree Traversal", difficulty: "hard", xp: 400, completed: false, description: "Implement post-order traversal" },
];

export default function Challenges() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard" | "completed">("all");

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "all") return true;
    if (filter === "completed") return c.completed;
    return c.difficulty === filter;
  });

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
            Challenges
          </h1>
        </div>

        <Tabs defaultValue="all" className="max-w-6xl mx-auto" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NeonCard
                    variant={challenge.difficulty === "easy" ? "cyan" : challenge.difficulty === "medium" ? "violet" : "blue"}
                    glow
                    className="h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{challenge.title}</h3>
                        {challenge.completed && (
                          <span className="text-2xl">✓</span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">{challenge.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <NeonBadge variant={challenge.difficulty}>{challenge.difficulty}</NeonBadge>
                          <NeonBadge variant="default">
                            <Zap className="w-3 h-3 mr-1" />
                            {challenge.xp} XP
                          </NeonBadge>
                        </div>
                      </div>

                      <Button
                        variant={challenge.completed ? "default" : "neon"}
                        className="w-full"
                        onClick={() => navigate(`/challenge/${challenge.id}`)}
                      >
                        {challenge.completed ? "Retry" : "Start"}
                      </Button>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-muted-foreground"
        >
          <p>"Don't fear the semicolon"</p>
        </motion.div>
      </div>
    </div>
  );
}
