import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeTerminal } from "@/components/CodeTerminal";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { MissionCard } from "@/components/MissionCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { questsData, Mission } from "@/data/questsData";
import { ArrowLeft, Scroll, Zap, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function QuestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const quest = questsData.find((q) => q.id === id);

  const [storyRevealed, setStoryRevealed] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load completed missions from localStorage
    const saved = localStorage.getItem(`byte_club_quest_${id}_missions`);
    if (saved) {
      try {
        setCompletedMissions(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load mission progress", e);
      }
    }

    // Reveal story with delay
    const timer = setTimeout(() => setStoryRevealed(true), 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setAnswer("");
    setSubmitted(false);
    setCorrect(false);
  };

  const handleSubmit = () => {
    if (!activeMission) return;

    if (!answer.trim()) {
      toast.error("Answer Required", {
        description: "Please enter your answer",
      });
      return;
    }

    const isCorrect = answer.trim().toLowerCase() === activeMission.correctAnswer.toLowerCase();
    setCorrect(isCorrect);
    setSubmitted(true);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      toast.success("Correct Answer!", {
        description: `+${activeMission.xp} XP earned`,
      });
      handleMissionComplete(activeMission);
    } else {
      toast.error("Incorrect", {
        description: "Try again, hacker!",
      });
    }
  };

  const handleMissionComplete = (mission: Mission) => {
    const newCompleted = new Set(completedMissions);
    newCompleted.add(mission.id);
    setCompletedMissions(newCompleted);

    // Save to localStorage
    localStorage.setItem(`byte_club_quest_${id}_missions`, JSON.stringify(Array.from(newCompleted)));

    // Update quest progress
    const progress = (newCompleted.size / (quest?.missions.length || 1)) * 100;
    const savedProgress = localStorage.getItem("byte_club_quest_progress");
    const progressData = savedProgress ? JSON.parse(savedProgress) : { progress: {}, completed: [] };
    
    progressData.progress[id!] = progress;
    
    // Mark quest as completed if all missions done
    if (newCompleted.size === quest?.missions.length) {
      if (!progressData.completed.includes(id)) {
        progressData.completed.push(id);
        toast.success("Quest Complete!", {
          description: `You've earned ${quest.xp} XP! 🎉`,
        });
      }
    }
    
    localStorage.setItem("byte_club_quest_progress", JSON.stringify(progressData));

    // Close modal after delay
    setTimeout(() => {
      setActiveMission(null);
      setAnswer("");
      setSubmitted(false);
    }, 1500);
  };

  const isMissionLocked = (index: number) => {
    if (index === 0) return false;
    const prevMissionId = quest?.missions[index - 1].id;
    return !completedMissions.has(prevMissionId!);
  };

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quest Not Found</h2>
          <Button variant="neon" onClick={() => navigate("/quests")}>
            Return to Quests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />
      <ConfettiEffect trigger={showConfetti} />

      {/* Animated Background Gradient */}
      <div className={`fixed inset-0 bg-gradient-to-br ${quest.color} opacity-5 blur-3xl`} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/quests")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quests
          </Button>
        </div>

        {/* Story Intro Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <NeonCard variant="cyan" glow className="backdrop-blur-sm bg-card/90">
            <div className="space-y-6">
              {/* Quest Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${quest.color} text-black font-bold mb-4`}>
                    QUEST BRIEFING
                  </div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {quest.title}
                  </h1>
                  <p className="text-lg text-muted-foreground italic">"{quest.tagline}"</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">{quest.xp} XP</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quest.missions.length} Missions
                  </div>
                </div>
              </div>

              {/* Transmission Effect */}
              <div className="relative p-4 rounded-lg bg-muted/30 border border-primary/30 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Scroll className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-sm font-mono text-primary">
                    &gt; TRANSMISSION FROM CENTRAL BYTE NODE...
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  {!storyRevealed ? (
                    <motion.div
                      key="decrypting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-sm text-muted-foreground"
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        Decrypting mission data...
                      </motion.span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="story"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <TypewriterText text={quest.story} speed={20} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scan Line Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-8"
                  animate={{
                    y: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </NeonCard>
        </motion.div>

        {/* Mission Timeline Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
            Mission Sequence
          </h2>
          <p className="text-sm text-muted-foreground ml-7 mt-2">
            Complete missions in order to unlock the next node
          </p>
        </motion.div>

        {/* Mission Timeline */}
        <div className="space-y-6 ml-4">
          {quest.missions.map((mission, index) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              index={index}
              isLocked={isMissionLocked(index)}
              isCompleted={completedMissions.has(mission.id)}
              onStart={() => handleStartMission(mission)}
            />
          ))}
        </div>

        {/* Mission Modal */}
        <Dialog open={!!activeMission} onOpenChange={() => {
          setActiveMission(null);
          setAnswer("");
          setSubmitted(false);
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-primary/30">
            {activeMission && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
                    {activeMission.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Description */}
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-muted-foreground">{activeMission.description}</p>
                  </div>

                  {/* Challenge */}
                  <NeonCard variant="violet" glow>
                    <h4 className="font-semibold mb-3">{activeMission.challenge}</h4>
                    <CodeTerminal
                      initialCode={answer}
                      onCodeChange={setAnswer}
                      disabled={submitted && correct}
                    />
                  </NeonCard>

                  {/* Hint */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-primary/20">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-primary">Hint:</span>
                      <p className="text-xs text-muted-foreground mt-1">{activeMission.hint}</p>
                    </div>
                  </div>

                  {/* Result */}
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
                                <h3 className="text-xl font-bold text-green-400">Correct!</h3>
                                <p className="text-muted-foreground">{activeMission.successText}</p>
                                <p className="text-sm text-primary mt-1">+{activeMission.xp} XP earned</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-12 h-12 text-red-400" />
                              <div>
                                <h3 className="text-xl font-bold text-red-400">Try Again</h3>
                                <p className="text-muted-foreground">Check your answer and retry</p>
                              </div>
                            </>
                          )}
                        </div>
                      </NeonCard>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      variant="cyber"
                      size="lg"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={submitted && correct}
                    >
                      {submitted && correct ? "Completed" : "Submit Answer"}
                    </Button>
                    {submitted && !correct && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setSubmitted(false);
                          setAnswer("");
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-muted-foreground text-sm"
        >
          <p>"Compile your courage. Debug your destiny."</p>
        </motion.div>
      </div>
    </div>
  );
}

// Typewriter effect component
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <p className="text-muted-foreground font-mono text-sm whitespace-pre-line">
        {displayText}
        {currentIndex < text.length && (
          <motion.span
            className="inline-block w-2 h-4 bg-primary ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </p>
    </div>
  );
}

