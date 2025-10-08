import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { ArrowLeft, Zap, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ChallengeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [answer, setAnswer] = useState("");
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock challenge data
  const challenge = {
    id: parseInt(id || "1"),
    title: "Array Reversal Challenge",
    description: "Write a function to reverse an array without using the built-in reverse() method. The function should modify the array in-place.",
    difficulty: "medium" as const,
    xp: 150,
    type: id && parseInt(id) % 2 === 0 ? "mcq" : "coding",
    question: "What is the time complexity of your solution?",
    options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: "O(n)",
  };

  const handleSubmit = () => {
    if (challenge.type === "coding" && !answer.trim()) {
      toast.error("Empty Code", {
        description: "Please write your solution first",
      });
      return;
    }

    if (challenge.type === "mcq" && !mcqAnswer) {
      toast.error("No Selection", {
        description: "Please select an answer",
      });
      return;
    }

    const isCorrect = challenge.type === "mcq" 
      ? mcqAnswer === challenge.correctAnswer
      : answer.length > 10; // Mock validation

    setCorrect(isCorrect);
    setSubmitted(true);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      toast.success("Bug Exterminated!", {
        description: `You earned ${challenge.xp} XP`,
      });
    } else {
      toast.error("Compilation Error", {
        description: "Try again, hacker!",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={15} />
      <ConfettiEffect trigger={showConfetti} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/challenges")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <NeonCard variant="cyan" glow>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
                <div className="flex gap-2">
                  <NeonBadge variant={challenge.difficulty}>{challenge.difficulty}</NeonBadge>
                  <NeonBadge variant="default">
                    <Zap className="w-3 h-3 mr-1" />
                    {challenge.xp} XP
                  </NeonBadge>
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
          </NeonCard>

          {challenge.type === "coding" ? (
            <NeonCard variant="violet" glow>
              <h3 className="text-lg font-semibold mb-4">Your Solution</h3>
              <Textarea
                placeholder="// Write your code here..."
                className="min-h-[300px] font-mono bg-input border-secondary/30 focus:border-secondary"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted && correct}
              />
            </NeonCard>
          ) : (
            <NeonCard variant="violet" glow>
              <h3 className="text-lg font-semibold mb-4">{challenge.question}</h3>
              <RadioGroup value={mcqAnswer} onValueChange={setMcqAnswer} disabled={submitted && correct}>
                {challenge.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </NeonCard>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <NeonCard variant={correct ? "cyan" : "violet"} glow>
                <div className="flex items-center gap-4">
                  {correct ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-400" />
                      <div>
                        <h3 className="text-xl font-bold text-green-400">Success!</h3>
                        <p className="text-muted-foreground">Compile your destiny! +{challenge.xp} XP earned</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-12 h-12 text-red-400" />
                      <div>
                        <h3 className="text-xl font-bold text-red-400">Try Again</h3>
                        <p className="text-muted-foreground">Debug your approach and retry</p>
                      </div>
                    </>
                  )}
                </div>
              </NeonCard>
            </motion.div>
          )}

          <div className="flex gap-4">
            <Button
              variant="cyber"
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitted && correct}
            >
              {submitted && correct ? "Completed" : "Submit Solution"}
            </Button>
            {submitted && !correct && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSubmitted(false);
                  setAnswer("");
                  setMcqAnswer("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
