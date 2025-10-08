import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

interface Node {
  id: number;
  title: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  unlocked: boolean;
  position: { x: number; y: number };
}

const nodes: Node[] = [
  { id: 1, title: "Variables 101", xp: 100, difficulty: "easy", completed: true, unlocked: true, position: { x: 20, y: 20 } },
  { id: 2, title: "Loops & Arrays", xp: 150, difficulty: "easy", completed: true, unlocked: true, position: { x: 35, y: 35 } },
  { id: 3, title: "Functions", xp: 200, difficulty: "medium", completed: false, unlocked: true, position: { x: 50, y: 25 } },
  { id: 4, title: "OOP Basics", xp: 250, difficulty: "medium", completed: false, unlocked: false, position: { x: 65, y: 40 } },
  { id: 5, title: "Recursion", xp: 300, difficulty: "hard", completed: false, unlocked: false, position: { x: 80, y: 30 } },
  { id: 6, title: "Data Structures", xp: 350, difficulty: "hard", completed: false, unlocked: false, position: { x: 75, y: 60 } },
];

export default function AdventureMap() {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(false);

  const handleNodeClick = (node: Node) => {
    if (!node.unlocked) {
      toast.error("Node Locked", {
        description: "Complete previous challenges first",
      });
      return;
    }

    if (node.completed) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }

    navigate(`/challenge/${node.id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />
      <ConfettiEffect trigger={confetti} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Adventure Map
          </h1>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <NeonCard variant="cyan" glow>
            <XPBar current={450} max={1000} level={3} />
          </NeonCard>
        </div>

        {/* Map Container */}
        <NeonCard variant="cyan" glow className="relative h-[600px] overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodes.slice(0, -1).map((node, i) => {
              const nextNode = nodes[i + 1];
              return (
                <motion.line
                  key={`line-${node.id}`}
                  x1={`${node.position.x}%`}
                  y1={`${node.position.y}%`}
                  x2={`${nextNode.position.x}%`}
                  y2={`${nextNode.position.y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node, index) => (
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
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <Button
                variant={node.completed ? "default" : node.unlocked ? "neon" : "outline"}
                size="lg"
                className={`relative w-20 h-20 rounded-full p-0 ${
                  !node.unlocked ? "opacity-50" : ""
                }`}
                onClick={() => handleNodeClick(node)}
              >
                {!node.unlocked && (
                  <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6" />
                )}
                <div className="text-center">
                  <div className="text-xs font-bold">{node.id}</div>
                </div>
              </Button>

              {/* Node Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-lg p-2 text-xs">
                  <div className="font-semibold">{node.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <NeonBadge variant={node.difficulty}>{node.difficulty}</NeonBadge>
                    <span className="text-primary">{node.xp} XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </NeonCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-muted-foreground"
        >
          <p>"Hack through the mainframe, one node at a time"</p>
        </motion.div>
      </div>
    </div>
  );
}
