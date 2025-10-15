import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { computeLevelProgress } from "@/lib/xp";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { QuestCard } from "@/components/QuestCard";
import { questsData } from "@/data/questsData";
import { ArrowLeft, Flame, Trophy, Zap } from "lucide-react";

export default function Quests() {
  const navigate = useNavigate();
  const [questProgress, setQuestProgress] = useState<Record<string, number>>({});
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("byte_club_quest_progress");
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setQuestProgress(data.progress || {});
        setCompletedQuests(new Set(data.completed || []));
      } catch (e) {
        console.error("Failed to load quest progress", e);
      }
    }
  }, []);

  const getQuestProgress = (questId: string) => {
    return questProgress[questId] || 0;
  };

  const isQuestCompleted = (questId: string) => {
    return completedQuests.has(questId);
  };

  const isQuestLocked = (index: number) => {
    // First quest is always unlocked
    if (index === 0) return false;
    // Check if previous quest is completed
    const prevQuestId = questsData[index - 1].id;
    return !isQuestCompleted(prevQuestId);
  };

  // Total XP from stored user plus quest completion progress contribution
  const storedUser = (() => {
    const u = localStorage.getItem("byteclub_user");
    try { return u ? JSON.parse(u) : null; } catch { return null; }
  })();
  const totalXP = Math.max(0, Math.floor(Number(storedUser?.totalXP || 0)));

  const { level, currentXP, requiredXP, percent } = computeLevelProgress(totalXP);

  const completedCount = completedQuests.size;
  const totalQuests = questsData.length;

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

  const handleLogout = () => {
    localStorage.removeItem("byteclub_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={25} />

      {/* Navbar */}
      <Navbar username={username} level={Math.floor(totalXP / 500)} xp={Math.round(totalXP)} onLogout={handleLogout} />

      {/* Animated Neon Circuits Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjeWFuIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* Cinematic Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              🔥 byte_club missions
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The Code Awakens
          </motion.p>
          <motion.div
            className="mt-6 inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">
                  <span className="text-primary font-bold">{completedCount}</span> / {totalQuests} Quests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-bold">3 Day Streak</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* HUD Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <NeonCard variant="cyan" glow className="backdrop-blur-sm bg-card/80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                  <div className="text-sm text-muted-foreground">Level</div>
                  <div className="text-2xl font-bold text-primary">Level {level}</div>
                  </div>
                </div>
                <NeonBadge variant="success" className="text-lg px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  Quest Hunter
                </NeonBadge>
              </div>
            <XPBar current={currentXP} max={requiredXP} level={level} />
            </div>
          </NeonCard>
        </motion.div>

        {/* Witty Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground italic">
            "Transmission received from Central Byte Node... Decrypting missions..."
          </p>
        </motion.div>

        {/* Quest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {questsData.map((quest, index) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              index={index}
              progress={getQuestProgress(quest.id)}
              isLocked={isQuestLocked(index)}
              isCompleted={isQuestCompleted(quest.id)}
            />
          ))}
        </div>

        {/* Footer Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16 text-muted-foreground"
        >
          <p>"Every mission decoded brings you closer to the Byte Origin."</p>
        </motion.div>
      </div>
    </div>
  );
}
