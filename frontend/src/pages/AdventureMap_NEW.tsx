import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adventureNodes, getNodeById, isNodeUnlocked, AdventureNode } from "@/data/adventureMapData";
import { Lock, Lightbulb, CheckCircle, XCircle, Zap, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdventureMap() {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(false);
  const getUserData = () => {
    const user = localStorage.getItem("byteclub_user");
    if (!user) return "Hacker";
    try {
      const userData = JSON.parse(user);
      return userData.username || "Hacker";
    } catch (error) {
      return "Hacker";
    }
  };
  
  const username = getUserData();
  
  // Progress tracking
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [activeNode, setActiveNode] = useState<AdventureNode | null>(null);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    // Load completed nodes from localStorage
    const saved = localStorage.getItem("byte_club_adventure_progress");
    if (saved) {
      try {
        setCompletedNodes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  const handleNodeClick = (node: AdventureNode) => {
    const unlocked = isNodeUnlocked(node.id, completedNodes);
    
    if (!unlocked) {
      toast.error("Node Locked", {
        description: "Complete previous nodes to unlock this path",
      });
      return;
    }

    if (completedNodes.includes(node.id)) {
      toast.success("Already Completed", {
        description: "You've conquered this node!",
      });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }

    // Open node challenge modal
    setActiveNode(node);
    setAnswer("");
    setShowHint(false);
    setSubmitted(false);
    setCorrect(false);
  };

  const handleSubmit = async () => {
    if (!activeNode) return;

    if (!answer.trim()) {
      toast.error("Answer Required", {
        description: "Enter your answer to proceed",
      });
      return;
    }

    // Check answer locally (Adventure Map works independently)
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = activeNode.correctAnswer.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    
    setCorrect(isCorrect);
    setSubmitted(true);

    if (isCorrect) {
      // Add to completed nodes
      const newCompleted = [...completedNodes, activeNode.id];
      setCompletedNodes(newCompleted);
      localStorage.setItem("byte_club_adventure_progress", JSON.stringify(newCompleted));

      // Update user XP in localStorage
      try {
        const userData = localStorage.getItem("byteclub_user");
        if (userData) {
          const user = JSON.parse(userData);
          user.totalXP = (user.totalXP || 0) + activeNode.xp;
          localStorage.setItem("byteclub_user", JSON.stringify(user));
        }
      } catch (e) {
        console.error("Failed to update XP:", e);
      }

      toast.success("Challenge Completed!", {
        description: `+${activeNode.xp} XP earned!`,
      });

      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);

      // Close modal after a short delay
      setTimeout(() => {
        setActiveNode(null);
      }, 2000);
    } else {
      toast.error("Incorrect Answer", {
        description: "Try again or use a hint",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {confetti && <ConfettiEffect />}
      <FloatingParticles />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Adventure Map
            </h1>
            <p className="text-muted-foreground">
              {completedNodes.length} / {adventureNodes.length} nodes completed
            </p>
          </div>
          <XPBar className="w-full md:w-auto" />
        </div>

        {/* Map Container */}
        <NeonCard variant="cyan" glow className="relative min-h-[800px] overflow-auto">
          {/* Matrix-Style Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                hsl(var(--primary) / 0.1) 2px,
                hsl(var(--primary) / 0.1) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                hsl(var(--primary) / 0.1) 2px,
                hsl(var(--primary) / 0.1) 4px
              )`
            }} />
          </div>
          
          <div className="relative w-full min-w-[3000px] h-[4000px]">
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {adventureNodes.map((node, index) => {
                return node.connections.map((targetId) => {
                  const targetNode = getNodeById(targetId);
                  if (!targetNode) return null;
                  
                  const isCompleted = completedNodes.includes(node.id);
                  const isNextNode = !completedNodes.includes(node.id) && isNodeUnlocked(node.id, completedNodes);
                  
                  // Convert percentage positions to pixel coordinates
                const x1 = (node.position.x / 100) * 3000;
                const y1 = ((node.position.y + 10) / 20) * 4000;
                const x2 = (targetNode.position.x / 100) * 3000;
                const y2 = ((targetNode.position.y + 10) / 20) * 4000;
                  
                  const pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
                  
                  return (
                    <motion.path
                      key={`path-${node.id}-${targetId}`}
                      d={pathData}
                      stroke={isCompleted ? "hsl(var(--primary))" : isNextNode ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                      strokeWidth={isCompleted ? "3" : isNextNode ? "2" : "1"}
                      strokeOpacity={isCompleted ? "0.6" : isNextNode ? "0.4" : "0.2"}
                      strokeDasharray={isCompleted ? "none" : "10,5"}
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: Math.min(index * 0.01, 1) }}
                    />
                  );
                });
              })}
          </svg>

          {/* Nodes with Visible Information */}
            {adventureNodes.map((node, index) => {
              const unlocked = isNodeUnlocked(node.id, completedNodes);
              const completed = completedNodes.includes(node.id);
              
              // Convert percentage positions to pixel coordinates
            const left = (node.position.x / 100) * 3000;
            const top = ((node.position.y + 10) / 20) * 4000;
              
              return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(index * 0.01, 2), type: "spring" }}
            >
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant={completed ? "default" : unlocked ? "neon" : "outline"}
                  size="lg"
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full p-0 transition-all duration-300 ${
                    !unlocked ? "opacity-50" : ""
                  } ${completed ? "bg-green-500/20 border-green-400" : ""}`}
                  onClick={() => handleNodeClick(node)}
                >
                  {!unlocked && (
                    <Lock className="w-5 h-5" />
                  )}
                  {completed && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  {!completed && unlocked && (
                    <span className="text-lg font-bold">{node.id}</span>
                  )}
                </Button>
                
                {/* Node Information - Always Visible */}
                <div className="text-center pointer-events-none">
                  <div className="text-xs md:text-sm font-bold text-primary mb-1 max-w-[120px] truncate">
                    {node.title}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <NeonBadge variant={node.difficulty === 'expert' ? 'hard' : node.difficulty} className="text-[10px] md:text-xs">
                      {node.difficulty}
                    </NeonBadge>
                    <span className="text-accent text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {node.xp}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
          </div>
        </NeonCard>
      </div>

      {/* Challenge Modal */}
      <AnimatePresence>
        {activeNode && (
          <Dialog open={!!activeNode} onOpenChange={() => setActiveNode(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {activeNode.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <NeonBadge variant={activeNode.difficulty === 'expert' ? 'hard' : activeNode.difficulty}>
                      {activeNode.difficulty}
                    </NeonBadge>
                    <span className="text-accent flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {activeNode.xp} XP
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Story */}
                <div className="p-4 bg-card/50 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground italic">{activeNode.story}</p>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Challenge:</h3>
                  <p className="text-foreground">{activeNode.question}</p>
                </div>

                {/* Options for MCQ */}
                {activeNode.type === "MCQ" && activeNode.options && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Options:</h3>
                    {activeNode.options.map((option, index) => (
                      <div key={index} className="p-3 bg-card/30 rounded-lg border border-border">
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hint Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="w-full"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Button>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent/10 rounded-lg border border-accent/30"
                  >
                    <p className="text-sm text-accent">{activeNode.hint}</p>
                  </motion.div>
                )}

                {/* Demo Answer Format */}
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-xs text-secondary">
                    <Eye className="w-3 h-3 inline mr-1" />
                    {activeNode.demoAnswer}
                  </p>
                </div>

                {/* Answer Input */}
                <div>
                  <Input
                    placeholder="Enter your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !submitted) {
                        handleSubmit();
                      }
                    }}
                    className="text-lg"
                    disabled={submitted && correct}
                  />
                </div>

                {/* Submit Result */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border-2 ${
                      correct
                        ? "bg-green-500/10 border-green-500"
                        : "bg-red-500/10 border-red-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {correct ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-green-500 font-bold">Correct! +{activeNode.xp} XP</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-500 font-bold">Incorrect. Try again!</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                {!submitted && (
                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                )}

                {submitted && !correct && (
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setAnswer("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

