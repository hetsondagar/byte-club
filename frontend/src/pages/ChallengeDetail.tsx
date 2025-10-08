import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { ArrowLeft, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api";

interface Challenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'true/false' | 'code';
  xpReward: number;
  content: {
    question: string;
    options?: string[];
    correctAnswer: string | number;
    codeSnippet?: string;
  };
  tags: string[];
  isDaily: boolean;
  isActive: boolean;
}

export default function ChallengeDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newStreak, setNewStreak] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        if (slug) {
          const challengeData = await apiService.getChallenge(slug);
          setChallenge(challengeData);
        }
      } catch (error) {
        console.error('Failed to fetch challenge:', error);
        toast.error('Failed to load challenge');
        navigate('/challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [slug, navigate]);

  const handleSubmit = async () => {
    if (!challenge) return;

    if (challenge.type === "code" && !answer.trim()) {
      toast.error("Answer Required", {
        description: "Please enter your code solution",
      });
      return;
    }

    if (challenge.type === "mcq" && !mcqAnswer) {
      toast.error("No Selection", {
        description: "Please select an answer",
      });
      return;
    }

    if (challenge.type === "true/false" && !mcqAnswer) {
      toast.error("No Selection", {
        description: "Please select true or false",
      });
      return;
    }

    try {
      setSubmitting(true);
      const userAnswer = challenge.type === "mcq" || challenge.type === "true/false" ? mcqAnswer : answer;
      
      const result = await apiService.submitChallenge(challenge.slug, userAnswer);
      
      setSubmitted(true);
      setCorrect(result.isCorrect);
      setXpEarned(result.xpEarned);
      setNewStreak(result.streak);

      if (result.isCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success("Correct Answer!", {
          description: `You earned ${result.xpEarned} XP!`,
        });
        
        // Update user data in localStorage
        const user = localStorage.getItem("byteclub_user");
        if (user) {
          const userData = JSON.parse(user);
          userData.totalXP = result.totalXP;
          userData.currentStreak = result.streak;
          localStorage.setItem("byteclub_user", JSON.stringify(userData));
        }
      } else {
        toast.error("Incorrect Answer", {
          description: "Try again or check the hint",
        });
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
      toast.error("Submission Failed", {
        description: "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles count={15} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles count={15} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Challenge not found</p>
            <Button onClick={() => navigate("/challenges")} className="mt-4">
              Go to Challenges
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                    {challenge.xpReward} XP
                  </NeonBadge>
                  {challenge.isDaily && (
                    <NeonBadge variant="success">Daily Challenge</NeonBadge>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
          </NeonCard>

          {challenge.type === "code" ? (
            <NeonCard variant="violet" glow>
              <h3 className="text-lg font-semibold mb-4">{challenge.content.question}</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Write your code solution here..."
                  className="w-full h-32 p-3 rounded-lg bg-input border-secondary/30 focus:border-secondary font-mono text-sm"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitted && correct}
                />
                {challenge.content.codeSnippet && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-2">
                      💡 <span className="font-semibold">Code Template:</span>
                    </p>
                    <pre className="text-xs font-mono text-muted-foreground">
                      {challenge.content.codeSnippet}
                    </pre>
                  </div>
                )}
              </div>
            </NeonCard>
          ) : challenge.type === "mcq" ? (
            <NeonCard variant="violet" glow>
              <h3 className="text-lg font-semibold mb-4">{challenge.content.question}</h3>
              <RadioGroup value={mcqAnswer} onValueChange={setMcqAnswer} disabled={submitted && correct}>
                {challenge.content.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </NeonCard>
          ) : (
            <NeonCard variant="violet" glow>
              <h3 className="text-lg font-semibold mb-4">{challenge.content.question}</h3>
              <RadioGroup value={mcqAnswer} onValueChange={setMcqAnswer} disabled={submitted && correct}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                </div>
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
                        <p className="text-muted-foreground">
                          Compile your destiny! +{xpEarned} XP earned
                          {newStreak > 0 && ` • ${newStreak} day streak!`}
                        </p>
                        {newBadges.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-primary">🏆 New badges unlocked!</p>
                            <div className="flex gap-1 mt-1">
                              {newBadges.map((badge, index) => (
                                <span key={index} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                  {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
              disabled={submitted && correct || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : submitted && correct ? (
                "Completed"
              ) : (
                "Submit Solution"
              )}
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
