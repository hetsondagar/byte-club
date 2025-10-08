import { motion } from "framer-motion";
import { NeonCard } from "./ui/neon-card";
import { NeonBadge } from "./ui/neon-badge";
import { Mission } from "@/data/questsData";
import { Lock, Zap, CheckCircle, Terminal, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

interface MissionCardProps {
  mission: Mission;
  index: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  onStart: () => void;
}

export function MissionCard({ mission, index, isLocked = false, isCompleted = false, onStart }: MissionCardProps) {
  const difficultyColor = {
    Easy: "easy",
    Medium: "medium",
    Hard: "hard",
  }[mission.difficulty] as "easy" | "medium" | "hard";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connection Line */}
      {index > 0 && (
        <div className="absolute left-6 -top-6 w-0.5 h-6 bg-primary/30" />
      )}

      <NeonCard
        variant={isCompleted ? "cyan" : isLocked ? "default" : "violet"}
        glow={!isLocked && !isCompleted}
        className={`relative ${isLocked ? "opacity-60" : ""}`}
      >
        {/* Mission Number Badge */}
        <div className="absolute -left-3 top-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
            isCompleted ? "bg-green-500/20 border-green-400 text-green-400" :
            isLocked ? "bg-muted border-muted-foreground text-muted-foreground" :
            "bg-primary/20 border-primary text-primary animate-pulse-glow"
          }`}>
            {isCompleted ? <CheckCircle className="w-6 h-6" /> : 
             isLocked ? <Lock className="w-5 h-5" /> :
             index + 1}
          </div>
        </div>

        <div className="pl-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-2">{mission.title}</h4>
              <div className="flex gap-2 flex-wrap">
                <NeonBadge variant={difficultyColor}>{mission.difficulty}</NeonBadge>
                <NeonBadge variant="default">
                  <Zap className="w-3 h-3 mr-1" />
                  {mission.xp} XP
                </NeonBadge>
                {mission.tags.map((tag) => (
                  <NeonBadge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </NeonBadge>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {!isLocked && (
            <>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-muted-foreground">{mission.description}</p>
              </div>

              {/* Challenge */}
              <div className="p-4 rounded-lg bg-muted/30 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Challenge</span>
                </div>
                <p className="text-sm text-muted-foreground">{mission.challenge}</p>
              </div>

              {/* Hint */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                <Lightbulb className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-secondary">Hint:</span>
                  <p className="text-xs text-muted-foreground mt-1">{mission.hint}</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant={isCompleted ? "default" : "cyber"}
                className="w-full"
                onClick={onStart}
                disabled={isLocked}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mission Complete
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4 mr-2" />
                    Start Mission
                  </>
                )}
              </Button>
            </>
          )}

          {/* Locked State */}
          {isLocked && (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Complete previous missions to unlock</p>
            </div>
          )}
        </div>

        {/* Completion Glow */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-green-400/10"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </NeonCard>
    </motion.div>
  );
}

