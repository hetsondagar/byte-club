import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adventureNodes, getNodeById, isNodeUnlocked, AdventureNode } from "@/data/adventureMapData";
import { Lock, Lightbulb, CheckCircle, XCircle, Zap, Eye } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { updateStreakOnActivity } from "@/lib/streak";

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
  const [selectedOption, setSelectedOption] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [forceUpdate, setForceUpdate] = useState({});

  // Debug: Monitor completedNodes state changes
  useEffect(() => {
    console.log("🔄 completedNodes state changed:", completedNodes);
  }, [completedNodes]);

  useEffect(() => {
    // Debug: Check if adventureNodes loaded
    console.log("Adventure Map Loaded");
    console.log("Total nodes:", adventureNodes.length);
    console.log("First 3 nodes:", adventureNodes.slice(0, 3));
    
    // Load completed nodes from backend first, then fallback to localStorage
    const loadAdventureProgress = async () => {
      try {
        const result = await apiService.getAdventureProgress();
        console.log("Backend adventure progress result:", result);
        
        // Handle both response structures: { data: {...} } and { data: { completedNodes: [...] } }
        let completedNodes = [];
        if (result.data?.completedNodes) {
          completedNodes = result.data.completedNodes;
        } else if (result.completedNodes) {
          completedNodes = result.completedNodes;
        }
        
        if (completedNodes && completedNodes.length >= 0) {
          setCompletedNodes(completedNodes);
          // Also update localStorage with backend data
          localStorage.setItem("byte_club_adventure_progress", JSON.stringify(completedNodes));
          console.log("✅ Loaded adventure progress from backend:", completedNodes);
        }
      } catch (error) {
        console.log("Failed to load from backend, using localStorage:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("byte_club_adventure_progress");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCompletedNodes(parsed);
            console.log("✅ Loaded adventure progress from localStorage:", parsed);
          } catch (e) {
            console.error("Failed to load progress", e);
          }
        }
      }
    };

    loadAdventureProgress();

    // Listen for adventure progress updates
    const handleAdventureProgressUpdate = () => {
      loadAdventureProgress();
    };
    
    window.addEventListener('adventureProgressUpdate', handleAdventureProgressUpdate);

    // Auto-scroll to starting node (Node 1) after a short delay
    setTimeout(() => {
      const mapContainer = document.querySelector('.overflow-x-auto.overflow-y-auto');
      if (mapContainer) {
        // Node 1 is at x=50, y=95 which maps to approximately center-top
        const startX = 200 + (50 / 100) * 3600; // ~2000px
        const startY = 200 + ((95 - 95) / 101) * 5600; // ~200px
        
        // Scroll to center the starting node
        mapContainer.scrollTo({
          left: startX - mapContainer.clientWidth / 2,
          top: startY - 100,
          behavior: 'smooth'
        });
      }
    }, 500);

    // Listen for progress updates to refresh path colors
    const handleProgressUpdate = () => {
      forceUpdate({});
    };
    window.addEventListener('adventureProgressUpdate', handleProgressUpdate);

    return () => {
      window.removeEventListener('adventureProgressUpdate', handleProgressUpdate);
    };
  }, []);

  const handleNodeClick = (node: AdventureNode) => {
    const unlocked = isNodeUnlocked(node.id, completedNodes);
    
    if (!unlocked) {
      toast.error("Node Locked", {
        description: "Complete previous nodes to unlock this path",
      });
      return;
    }

    if (completedNodes.includes(node.id) || completedNodes.includes(node.id.toString())) {
      toast.success("Already Completed", {
        description: "You've conquered this node!",
      });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }

    // Open node challenge modal
    setActiveNode(node);
    setAnswer("");
    setSelectedOption("");
    setShowHint(false);
    setSubmitted(false);
    setCorrect(false);
  };

  const handleSubmit = async () => {
    if (!activeNode) return;

    // Get the user's answer based on question type
    let userAnswer = "";
    if (activeNode.type === "MCQ") {
      if (!selectedOption) {
        toast.error("Answer Required", {
          description: "Please select an option to proceed",
        });
        return;
      }
      userAnswer = selectedOption;
    } else {
      if (!answer.trim()) {
        toast.error("Answer Required", {
          description: "Enter your answer to proceed",
        });
        return;
      }
      userAnswer = answer.trim();
    }

    // Check answer locally (Adventure Map works independently)
    const correctAnswer = activeNode.correctAnswer.toLowerCase();
    const isCorrect = userAnswer.toLowerCase() === correctAnswer;
    
    setCorrect(isCorrect);
    setSubmitted(true);

    if (isCorrect) {
      // Update streak on successful adventure completion
      console.log('🔥 ACTIVITY COMPLETED - Calling updateStreakOnActivity...');
      let streakOutcome;
      try {
        streakOutcome = updateStreakOnActivity();
        console.log('🔍 Adventure streak update result:', streakOutcome);
        console.log('🔍 Streak outcome state:', streakOutcome.state);
        console.log('🔍 Streak state has dates?', {
          hasDate: !!streakOutcome.state.lastActiveDate,
          hasTime: !!streakOutcome.state.lastActiveTime,
          date: streakOutcome.state.lastActiveDate,
          time: streakOutcome.state.lastActiveTime
        });
      } catch (error) {
        console.error('❌ ERROR calling updateStreakOnActivity:', error);
        // Fallback: manually set dates
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toISOString();
        try {
          const userData = localStorage.getItem("byteclub_user");
          if (userData) {
            const user = JSON.parse(userData);
            user.lastActiveDate = today;
            user.lastActiveTime = now;
            user.currentStreak = (user.currentStreak || 0) + 1;
            localStorage.setItem("byteclub_user", JSON.stringify(user));
            console.log('✅ Manual date save after error:', { date: today, time: now });
          }
        } catch (e) {
          console.error('❌ Failed manual save:', e);
        }
        streakOutcome = { updated: true, state: { currentStreak: 1, longestStreak: 1, lastActiveDate: today, lastActiveTime: now }, bonusXP: 0, streakBroken: false, isFirstActivity: true };
      }
      
      // Show streak notifications (only show streak broken for existing users)
      if (streakOutcome.streakBroken) {
        toast.error("Streak Broken!", {
          description: "You haven't been active for more than 2 days. Starting a new streak!",
        });
      } else if (streakOutcome.updated) {
        if (streakOutcome.isFirstActivity) {
          toast.success("Streak Started!", {
            description: `🔥 Welcome! Your coding streak has begun!`,
          });
        } else {
          toast.success("Streak Updated!", {
            description: `🔥 ${streakOutcome.state.currentStreak} day streak! Keep it up!`,
          });
        }
      } else {
        // Streak not updated (same day activity)
        console.log('Streak not updated - same day activity');
      }
      
      // Add to completed nodes locally first
      const newCompleted = [...completedNodes, activeNode.id];
      console.log("🔍 Before update - completedNodes:", completedNodes);
      console.log("🔍 Adding node:", activeNode.id);
      console.log("🔍 New completed array:", newCompleted);
      
      setCompletedNodes(newCompleted);
      localStorage.setItem("byte_club_adventure_progress", JSON.stringify(newCompleted));
      
      console.log(`✅ Node ${activeNode.id} completed! Unlocking connected nodes:`, activeNode.connections);

      // Update user XP and PRESERVE streak dates in localStorage
      try {
        const userData = localStorage.getItem("byteclub_user");
        if (userData) {
          const user = JSON.parse(userData);
          
          // Verify what updateStreakOnActivity actually saved
          console.log('🔍 After updateStreakOnActivity - localStorage user:', {
            currentStreak: user.currentStreak,
            lastActiveDate: user.lastActiveDate,
            lastActiveTime: user.lastActiveTime
          });
          
          // Update XP
          user.totalXP = (user.totalXP || 0) + activeNode.xp;
          
          // CRITICAL: Always preserve dates from streak outcome, even if they seem to be missing
          // The dates SHOULD have been saved by updateStreakOnActivity, but let's ensure they're there
          if (streakOutcome.state.lastActiveDate) {
            user.currentStreak = streakOutcome.state.currentStreak;
            user.lastActiveDate = streakOutcome.state.lastActiveDate;
            user.lastActiveTime = streakOutcome.state.lastActiveTime;
            console.log('✅ Setting dates from streak outcome:', {
              date: streakOutcome.state.lastActiveDate,
              time: streakOutcome.state.lastActiveTime
            });
          } else {
            // Fallback: Set dates manually if they're missing
            const today = new Date().toISOString().slice(0, 10);
            const now = new Date().toISOString();
            user.lastActiveDate = today;
            user.lastActiveTime = now;
            user.currentStreak = streakOutcome.state.currentStreak || 1;
            console.log('⚠️ Dates missing from streak outcome, setting manually:', {
              date: today,
              time: now
            });
          }
          
          localStorage.setItem("byteclub_user", JSON.stringify(user));
          
          // Verify they were saved
          const verify = JSON.parse(localStorage.getItem("byteclub_user") || '{}');
          console.log('✅ Final localStorage verification:', {
            currentStreak: verify.currentStreak,
            lastActiveDate: verify.lastActiveDate,
            lastActiveTime: verify.lastActiveTime
          });
          
          // Sync updated streak and date to backend (async, don't wait)
          apiService.updateProfile({ 
            currentStreak: verify.currentStreak || streakOutcome.state.currentStreak,
            lastChallengeDate: verify.lastActiveDate ? new Date(verify.lastActiveDate) : new Date()
          }).catch(err => console.error('Failed to sync streak to backend:', err));
        }
      } catch (e) {
        console.error("❌ Failed to update XP and streak:", e);
      }

      // Try to sync with backend if user is authenticated
      const token = localStorage.getItem("byteclub_token");
      if (token) {
        try {
          const result = await apiService.completeAdventureNode(activeNode.id, activeNode.xp);
          
          if (result.success) {
            // Update user data with fresh data from backend
            const userData = localStorage.getItem("byteclub_user");
            if (userData) {
              const user = JSON.parse(userData);
              // CRITICAL: Preserve streak dates when updating from backend
              const existingDates = {
                lastActiveDate: user.lastActiveDate,
                lastActiveTime: user.lastActiveTime,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak
              };
              
              user.totalXP = result.data?.totalXP || result.totalXP;
              
              // Restore dates if they were set earlier
              if (existingDates.lastActiveDate) {
                user.lastActiveDate = existingDates.lastActiveDate;
                user.lastActiveTime = existingDates.lastActiveTime;
                user.currentStreak = existingDates.currentStreak;
                user.longestStreak = existingDates.longestStreak;
              }
              
              localStorage.setItem("byteclub_user", JSON.stringify(user));
              
              console.log("✅ Adventure progress synced with backend, dates preserved:", {
                lastActiveDate: user.lastActiveDate,
                lastActiveTime: user.lastActiveTime,
                currentStreak: user.currentStreak
              });
            }
            console.log("✅ Adventure progress synced with backend");
            
            // Show toast notifications for unlocked badges
            console.log('🔍 Adventure Map - Full result data:', result.data);
            console.log('🔍 Adventure Map - badgesUnlocked:', result.data?.badgesUnlocked);
            
            if (Array.isArray(result.data?.badgesUnlocked) && result.data.badgesUnlocked.length > 0) {
              console.log('🎉 Adventure Map - Showing badge unlock toasts for:', result.data.badgesUnlocked);
              result.data.badgesUnlocked.forEach((badge: string) => {
                const badgeName = badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                toast.success(`🏆 Badge Unlocked!`, {
                  description: `${badgeName}`,
                  duration: 4000,
                });
              });
              
              // Show summary toast if multiple badges
              if (result.data.badgesUnlocked.length > 1) {
                toast.success(`🎉 ${result.data.badgesUnlocked.length} Badges Unlocked!`, {
                  description: `Great job completing the adventure!`,
                  duration: 5000,
                });
              }
            } else {
              console.log('🔍 Adventure Map - No badges unlocked or badgesUnlocked is empty');
            }
          } else if (result.message === 'Node already completed') {
            console.log("ℹ️ Node already completed, no XP awarded");
            // Still show success since the node is completed
          } else {
            console.warn("⚠️ Failed to sync with backend, but progress saved locally");
          }
        } catch (error) {
          console.warn("⚠️ Failed to sync with backend, but progress saved locally:", error);
        }
      } else {
        console.log("ℹ️ User not authenticated, progress saved locally only");
      }

      toast.success("Challenge Completed!", {
        description: `+${activeNode.xp} XP earned!`,
      });

      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);

      // Trigger update to refresh path colors and navbar
      window.dispatchEvent(new Event('adventureProgressUpdate'));
      window.dispatchEvent(new Event('challengeCompleted'));
      
      // Force re-render to update node states
      setForceUpdate({});
      
      // Also force a re-render by updating a dummy state
      setTimeout(() => {
        setForceUpdate(prev => ({ ...prev, timestamp: Date.now() }));
      }, 100);
      
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
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🗺️ ByteNet Adventure
            </h1>
            <p className="text-lg text-primary/80 mb-2 font-medium">
              Navigate the digital realm, solve CSE mysteries, and unlock the secrets of byte_club
            </p>
            <p className="text-muted-foreground">
              {completedNodes.length} / {adventureNodes.length} nodes conquered • {Math.round((completedNodes.length / adventureNodes.length) * 100)}% complete
            </p>
          </div>
          <XPBar className="w-full md:w-auto" />
        </div>

        {/* Map Container - Scrollable Both Directions - INCREASED HEIGHT */}
        <div className="relative w-full h-[calc(100vh-8rem)] overflow-x-auto overflow-y-auto border-2 border-primary/20 rounded-lg bg-gradient-to-br from-black via-slate-950 to-black shadow-2xl">
          {/* Debug Info */}
          {adventureNodes.length === 0 && (
            <div className="relative z-50 text-center p-8 bg-red-500/20 border-2 border-red-500 rounded-lg m-4">
              <p className="text-xl font-bold text-red-400">⚠️ No Adventure Nodes Loaded!</p>
              <p className="text-sm text-gray-300 mt-2">The adventure map data failed to load.</p>
            </div>
          )}
          
          {/* Scrollable Map Canvas with Grid Background */}
          <div 
            className="relative min-w-[4000px] min-h-[6000px] w-[4000px] h-[6000px]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 100px,
                  rgba(0, 255, 255, 0.05) 100px,
                  rgba(0, 255, 255, 0.05) 101px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 100px,
                  rgba(0, 255, 255, 0.05) 100px,
                  rgba(0, 255, 255, 0.05) 101px
                )
              `,
              backgroundSize: '100px 100px'
            }}
          >
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              {adventureNodes.map((node, index) => {
                return node.connections.map((targetId) => {
                  const targetNode = getNodeById(targetId);
                  if (!targetNode) return null;
                  
                  // Check if current node is completed
                  const isNodeCompleted = completedNodes.includes(node.id) || completedNodes.includes(node.id.toString());
                  
                  // Check if target node is unlocked (will be next to complete)
                  const isTargetUnlocked = isNodeUnlocked(targetId, completedNodes);
                  const isTargetCompleted = completedNodes.includes(targetId) || completedNodes.includes(targetId.toString());
                  
                  // Path should be:
                  // - CYAN if the source node is completed (showing completed progress)
                  // - PURPLE/MAGENTA if target node is unlocked and ready to be completed
                  // - WHITE if target is still locked
                  const isActivePath = isNodeCompleted && isTargetUnlocked && !isTargetCompleted;
                  const isCompletedPath = isNodeCompleted;
                  
                  // Convert positions to pixel coordinates with proper spacing
                  // X: 0-100 maps to 200-3800px (with margins)
                  // Y: 95 (start) to -6 (end) maps to 200-5800px (start at top, with margins)
                const x1 = 200 + (node.position.x / 100) * 3600;
                const y1 = 200 + ((95 - node.position.y) / 101) * 5600;
                const x2 = 200 + (targetNode.position.x / 100) * 3600;
                const y2 = 200 + ((95 - targetNode.position.y) / 101) * 5600;
                  
                  const pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
                  
                  return (
                    <motion.path
                      key={`path-${node.id}-${targetId}`}
                      d={pathData}
                      stroke={isActivePath ? "#a855f7" : isCompletedPath ? "#00ffff" : "#ffffff"}
                      strokeWidth={isActivePath ? "5" : isCompletedPath ? "4" : "2"}
                      strokeOpacity={isActivePath ? "0.9" : isCompletedPath ? "0.8" : "0.3"}
                      strokeDasharray={isActivePath ? "none" : isCompletedPath ? "none" : "6,3"}
                      fill="none"
                      filter={isActivePath ? "drop-shadow(0 0 8px #a855f7)" : isCompletedPath ? "drop-shadow(0 0 4px #00ffff)" : "none"}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: Math.min(index * 0.01, 1) }}
                    />
                  );
                });
              })}
          </svg>

          {/* Nodes with Visible Information */}
            {adventureNodes.length > 0 ? adventureNodes.map((node, index) => {
              // Use forceUpdate to ensure re-render when state changes
              const _ = forceUpdate;
              const unlocked = isNodeUnlocked(node.id, completedNodes);
              const completed = completedNodes.includes(node.id) || completedNodes.includes(node.id.toString());
              
              // Debug logging for first few nodes
              if (node.id <= 3) {
                console.log(`🔍 Node ${node.id}: unlocked=${unlocked}, completed=${completed}, completedNodes=`, completedNodes);
              }
              
              // Convert positions to pixel coordinates with proper spacing
              // X: 0-100 maps to 200-3800px (with margins)
              // Y: 95 (start) to -6 (end) maps to 200-5800px (start at top, with margins)
            const left = 200 + (node.position.x / 100) * 3600;
            const top = 200 + ((95 - node.position.y) / 101) * 5600;
              
              console.log(`Rendering node ${node.id} at position (${left}, ${top})`);
              
              return (
            <motion.div
              key={node.id}
              className="absolute z-20"
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
                  className={`relative w-20 h-20 rounded-full p-0 transition-all duration-300 shadow-lg ${
                    !unlocked ? "opacity-50" : ""
                  } ${completed ? "bg-green-500/20 border-green-400" : ""}`}
                  onClick={() => handleNodeClick(node)}
                >
                  {!unlocked && (
                    <Lock className="w-6 h-6" />
                  )}
                  {completed && (
                    <CheckCircle className="w-7 h-7 text-green-400" />
                  )}
                  {!completed && unlocked && (
                    <span className="text-xl font-bold">{node.id}</span>
                  )}
                </Button>
                
                {/* Node Information - Always Visible with Better Spacing */}
                <div className="text-center pointer-events-none mt-2">
                  <div className="text-sm font-bold text-primary mb-1 px-2 py-1 bg-black/60 rounded max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {node.title}
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-black/60 rounded px-2 py-1">
                    <NeonBadge variant={node.difficulty === 'expert' ? 'hard' : node.difficulty} className="text-xs">
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
        }) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="text-center p-8 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg">
              <p className="text-xl font-bold text-yellow-400">⚠️ No nodes to display</p>
              <p className="text-sm text-gray-300 mt-2">Adventure nodes array is empty</p>
            </div>
          </div>
        )}
          </div>
        </div>

        {/* Scroll Instructions - MOVED BELOW MAP */}
        <div className="text-center mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-primary font-medium">
            🖱️ <span className="font-bold">Scroll</span> horizontally and vertically to explore all 100 nodes • Click unlocked nodes to solve challenges
          </p>
        </div>
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
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Choose your answer:</h3>
                    <RadioGroup
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                      disabled={submitted && correct}
                    >
                      {activeNode.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-card/30 rounded-lg border border-border hover:bg-card/50 transition-colors">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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

                {/* Answer Input - Only for non-MCQ questions */}
                {activeNode.type !== "MCQ" && (
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
                )}

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
                    disabled={
                      activeNode.type === "MCQ" 
                        ? !selectedOption 
                        : !answer.trim()
                    }
                  >
                    Submit Answer
                  </Button>
                )}

                {submitted && !correct && (
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setAnswer("");
                      setSelectedOption("");
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

