import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Archive as ArchiveIcon, Zap, RotateCcw } from "lucide-react";

interface ArchivedChallenge {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  completedDate: string;
  score: number;
}

const archivedChallenges: ArchivedChallenge[] = [
  { id: 1, title: "Array Reversal", difficulty: "medium", xp: 150, completedDate: "2 days ago", score: 92 },
  { id: 2, title: "Binary Search", difficulty: "medium", xp: 200, completedDate: "5 days ago", score: 88 },
  { id: 3, title: "Palindrome Checker", difficulty: "easy", xp: 100, completedDate: "1 week ago", score: 95 },
  { id: 4, title: "Fibonacci Sequence", difficulty: "easy", xp: 75, completedDate: "1 week ago", score: 100 },
  { id: 5, title: "String Manipulation", difficulty: "easy", xp: 80, completedDate: "2 weeks ago", score: 90 },
  { id: 6, title: "Sorting Algorithms", difficulty: "hard", xp: 300, completedDate: "2 weeks ago", score: 85 },
];

export default function Archive() {
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
            Archive
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ArchiveIcon className="w-10 h-10 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Completed Challenges</h2>
                    <p className="text-muted-foreground">Review your past victories</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{archivedChallenges.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NeonCard
                  variant={challenge.difficulty === "easy" ? "cyan" : challenge.difficulty === "medium" ? "violet" : "blue"}
                  glow
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{challenge.title}</h3>
                      <div className={`text-2xl font-bold ${
                        challenge.score >= 90 ? "text-green-400" :
                        challenge.score >= 70 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {challenge.score}%
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <NeonBadge variant={challenge.difficulty}>{challenge.difficulty}</NeonBadge>
                      <NeonBadge variant="default">
                        <Zap className="w-3 h-3 mr-1" />
                        {challenge.xp} XP
                      </NeonBadge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Completed {challenge.completedDate}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/challenge/${challenge.id}`)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Re-attempt
                    </Button>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground"
          >
            <p>"Every challenge conquered is a step toward mastery"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
