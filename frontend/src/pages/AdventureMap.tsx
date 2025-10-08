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
import { apiService } from "@/services/api";

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

    try {
      // Submit to backend API
      const result = await apiService.submitChallenge(activeNode.slug, answer.trim());
      
      setCorrect(result.isCorrect);
      setSubmitted(true);

      if (result.isCorrect) {
        // Add to completed nodes
        const newCompleted = [...completedNodes, activeNode.id];
        setCompletedNodes(newCompleted);
        localStorage.setItem("byte_club_adventure_progress", JSON.stringify(newCompleted));

        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
        
        toast.success("Node Conquered!", {
          description: `+${result.xpEarned} XP earned! ${result.streak > 0 ? `• ${result.streak} day streak!` : ''}`,
        });

        // Update user data in localStorage
        const user = localStorage.getItem("byteclub_user");
        if (user) {
          const userData = JSON.parse(user);
          userData.totalXP = result.totalXP;
          userData.currentStreak = result.streak;
          localStorage.setItem("byteclub_user", JSON.stringify(userData));
        }

        // Close modal after delay
        setTimeout(() => {
          setActiveNode(null);
          setAnswer("");
        }, 2000);
      } else {
        toast.error("Incorrect Answer", {
          description: "Try again, hacker!",
        });
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
      toast.error("Submission Failed", {
        description: "Please try again",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("byteclub_user");
    navigate("/");
  };

  const totalXP = completedNodes.reduce((sum, nodeId) => {
    const node = getNodeById(nodeId);
    return sum + (node?.xp || 0);
  }, 0);

  const currentLevel = Math.floor(totalXP / 100) + 1;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />
      <ConfettiEffect trigger={confetti} />

      {/* Navbar */}
      <Navbar username={username} level={3} xp={450} onLogout={handleLogout} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Adventure Map
          </h1>
          <p className="text-center text-muted-foreground mt-2">100 nodes • Epic coding journey</p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <NeonCard variant="cyan" glow>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-2xl font-bold text-primary">
                  {completedNodes.length} / {adventureNodes.length} Nodes
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total XP</div>
                <div className="text-2xl font-bold text-secondary">{totalXP.toLocaleString()}</div>
              </div>
            </div>
            <XPBar current={totalXP} max={(currentLevel * 100)} level={currentLevel} />
          </NeonCard>
        </div>

        {/* Map Container */}
        <NeonCard variant="cyan" glow className="relative min-h-[800px] overflow-auto">
          <div className="relative w-[200%] h-[3000px] md:w-[250%] md:h-[3500px]">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {adventureNodes.map((node) => {
                return node.connections.map((targetId) => {
                  const targetNode = getNodeById(targetId);
                  if (!targetNode) return null;
                  
                  const isCompleted = completedNodes.includes(node.id);
                  
                  return (
                    <motion.line
                      key={`line-${node.id}-${targetId}`}
                      x1={`${node.position.x}%`}
                      y1={`${node.position.y}%`}
                      x2={`${targetNode.position.x}%`}
                      y2={`${targetNode.position.y}%`}
                      stroke={isCompleted ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                      strokeWidth="3"
                      strokeOpacity={isCompleted ? "0.6" : "0.2"}
                      strokeDasharray="8,4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: Math.min(node.id * 0.01, 2) }}
                    />
                  );
                });
              })}
          </svg>

          {/* Nodes */}
            {adventureNodes.map((node, index) => {
              const unlocked = isNodeUnlocked(node.id, completedNodes);
              const completed = completedNodes.includes(node.id);
              
              return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.01, 2), type: "spring" }}
            >
                  <Button
                    variant={completed ? "default" : unlocked ? "neon" : "outline"}
                    size="lg"
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full p-0 text-base md:text-lg ${
                      !unlocked ? "opacity-50" : ""
                    } ${completed ? "bg-green-500/20 border-green-400" : ""}`}
                    onClick={() => handleNodeClick(node)}
                  >
                    {!unlocked && (
                      <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5" />
                    )}
                    {completed && (
                      <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-400" />
                    )}
                    {!completed && unlocked && (
                <div className="text-center">
                        <div className="text-sm font-bold">{node.id}</div>
                </div>
                    )}
              </Button>

                  {/* Node Tooltip */}
                  <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none z-20">
                    <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-sm shadow-lg">
                      <div className="font-semibold max-w-[250px] truncate text-primary">{node.title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <NeonBadge variant={node.difficulty}>{node.difficulty}</NeonBadge>
                        <span className="text-primary font-bold">{node.xp} XP</span>
                      </div>
                    </div>
                  </div>
            </motion.div>
              );
            })}
          </div>
        </NeonCard>

        {/* Node Challenge Modal */}
        <Dialog open={!!activeNode} onOpenChange={() => {
          setActiveNode(null);
          setAnswer("");
          setShowHint(false);
          setSubmitted(false);
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-primary/30">
            {activeNode && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${
                      activeNode.difficulty === 'easy' ? 'from-green-400 to-cyan-400' :
                      activeNode.difficulty === 'medium' ? 'from-yellow-400 to-orange-400' :
                      activeNode.difficulty === 'hard' ? 'from-red-400 to-pink-400' :
                      'from-purple-400 to-fuchsia-400'
                    } text-black font-bold`}>
                      {activeNode.id}
                    </div>
                    {activeNode.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Story */}
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="p-4 rounded-lg bg-muted/30 border border-primary/20">
                      <p className="text-muted-foreground italic">{activeNode.story}</p>
                    </div>
                  </div>

                  {/* Question */}
                  <NeonCard variant="violet" glow>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Challenge Question
                    </h4>
                    <p className="text-foreground mb-4">{activeNode.question}</p>
                    
                    {/* Demo Answer Format */}
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-4 h-4 text-secondary" />
                      <span className="text-xs text-muted-foreground">
                        Answer format: <span className="text-secondary font-mono">{activeNode.demoAnswer}</span>
                      </span>
                    </div>

                    <Input
                      placeholder="Type your answer here..."
                      className="text-lg font-mono bg-input border-secondary/30 focus:border-secondary"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={submitted && correct}
                      maxLength={50}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !submitted) {
                          handleSubmit();
                        }
                      }}
                    />
                  </NeonCard>

                  {/* Hint System */}
                  <div className="space-y-3">
                    {!showHint ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(true)}
                        className="border-primary/30 hover:border-primary"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Show Hint
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30"
                      >
                        <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-primary">Hint:</span>
                          <p className="text-xs text-muted-foreground mt-1">{activeNode.hint}</p>
                        </div>
                      </motion.div>
                    )}
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
                                <p className="text-muted-foreground">Node conquered! Path unlocked!</p>
                                <p className="text-sm text-primary mt-1">+{activeNode.xp} XP earned</p>
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

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-primary/20">
                    <div className="flex items-center gap-2">
                      <NeonBadge variant={activeNode.difficulty}>{activeNode.difficulty}</NeonBadge>
                      <span>Node {activeNode.id}/100</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-bold text-primary">{activeNode.xp} XP</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-muted-foreground"
        >
          <p>"100 nodes. One epic journey. Hack through the mainframe."</p>
        </motion.div>
      </div>
    </div>
  );
}
