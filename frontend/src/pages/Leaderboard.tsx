import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  badges: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "CodeNinja", xp: 12450, level: 28, badges: 45 },
  { rank: 2, username: "ByteMaster", xp: 11200, level: 26, badges: 42 },
  { rank: 3, username: "LoopLegend", xp: 10800, level: 25, badges: 38 },
  { rank: 4, username: "RecursiveRick", xp: 9500, level: 23, badges: 35 },
  { rank: 5, username: "ArrayAce", xp: 8900, level: 22, badges: 32 },
  { rank: 6, username: "FunctionFury", xp: 8200, level: 21, badges: 30 },
  { rank: 7, username: "AlgoAddict", xp: 7800, level: 20, badges: 28 },
  { rank: 8, username: "DataDruid", xp: 7200, level: 19, badges: 25 },
  { rank: 9, username: "SyntaxSage", xp: 6800, level: 18, badges: 23 },
  { rank: 10, username: "You", xp: 2450, level: 12, badges: 8 },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("alltime");
  const username = localStorage.getItem("byteclub_user") || "Hacker";

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "cyan";
    if (rank === 2) return "violet";
    if (rank === 3) return "blue";
    return "default";
  };

  const handleLogout = () => {
    localStorage.removeItem("byteclub_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      {/* Navbar */}
      <Navbar username={username} level={12} xp={2450} onLogout={handleLogout} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">Top hackers in the realm</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="alltime" className="mb-8" onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-4 mt-8">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NeonCard
                    variant={getRankColor(entry.rank) as any}
                    glow={entry.rank <= 3}
                    className={`cursor-pointer ${entry.username === "You" ? "border-primary border-2" : ""}`}
                    onClick={() => navigate(`/leaderboard/${entry.username}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {entry.username}
                            {entry.username === "You" && (
                              <span className="ml-2 text-xs text-primary">(You)</span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Level {entry.level} • {entry.badges} badges
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground"
          >
            <p>"Climb the ranks, hack the system"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
