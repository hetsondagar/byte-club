import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { NeonCard } from "./ui/neon-card";
import { NeonBadge } from "./ui/neon-badge";
import { Quest } from "@/data/questsData";
import { Lock, Zap, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface QuestCardProps {
  quest: Quest;
  index: number;
  progress: number; // 0-100
  isLocked?: boolean;
  isCompleted?: boolean;
}

export function QuestCard({ quest, index, progress, isLocked = false, isCompleted = false }: QuestCardProps) {
  const navigate = useNavigate();

  const handleEnter = () => {
    if (!isLocked) {
      navigate(`/quests/${quest.id}`);
    }
  };

  const difficultyColor = {
    Easy: "easy",
    Medium: "medium",
    Hard: "hard",
    "Very Hard": "hard",
  }[quest.difficulty] as "easy" | "medium" | "hard";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
    >
      <NeonCard
        variant="cyan"
        glow={!isLocked}
        className={`relative overflow-hidden cursor-pointer h-full ${
          isLocked ? "opacity-60" : ""
        } ${isCompleted ? "border-green-400/40" : ""}`}
        onClick={handleEnter}
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${quest.color} opacity-10 blur-xl`}
        />

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-10">
            <Lock className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>
          </div>
        )}

        <div className="relative space-y-4">
          {/* Quest Number */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${quest.color} text-black font-bold text-sm`}>
              QUEST {index + 1}
            </div>
            <NeonBadge variant={difficultyColor}>{quest.difficulty}</NeonBadge>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {quest.title}
          </h3>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground italic">"{quest.tagline}"</p>

          {/* XP and Missions */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{quest.xp} XP</span>
            </div>
            <span className="text-muted-foreground">
              {quest.missions.length} Missions
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${quest.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  boxShadow: `0 0 10px ${quest.color.includes("cyan") ? "hsl(180 100% 50% / 0.5)" : "hsl(270 100% 62% / 0.5)"}`,
                }}
              />
            </div>
          </div>

          {/* Enter Button */}
          {!isLocked && (
            <Button
              variant={isCompleted ? "default" : "neon"}
              className="w-full"
              onClick={handleEnter}
            >
              {isCompleted ? "Review Mission" : "Enter Quest"}
            </Button>
          )}

          {isLocked && (
            <Button variant="outline" className="w-full" disabled>
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </Button>
          )}
        </div>

        {/* Animated Border Pulse */}
        {!isLocked && !isCompleted && (
          <motion.div
            className={`absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r ${quest.color} opacity-0`}
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "2px",
            }}
          />
        )}
      </NeonCard>
    </motion.div>
  );
}

