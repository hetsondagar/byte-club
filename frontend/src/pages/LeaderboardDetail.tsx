import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { XPBar } from "@/components/ui/xp-bar";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Trophy, Zap, Award, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const xpHistory = [
  { week: "W1", xp: 450 },
  { week: "W2", xp: 780 },
  { week: "W3", xp: 1200 },
  { week: "W4", xp: 1850 },
  { week: "W5", xp: 2450 },
];

const recentChallenges = [
  { title: "Binary Search", xp: 200, date: "Yesterday" },
  { title: "Array Manipulation", xp: 150, date: "2 days ago" },
  { title: "String Reversal", xp: 100, date: "5 days ago" },
];

export default function LeaderboardDetail() {
  const navigate = useNavigate();
  const { username } = useParams();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/leaderboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leaderboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold border-4 border-primary/30">
                  {username?.[0]?.toUpperCase() || "C"}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">{username || "CodeNinja"}</h2>
                  <div className="flex gap-2 mb-4">
                    <NeonBadge variant="default">
                      <Trophy className="w-3 h-3 mr-1" />
                      Rank #1
                    </NeonBadge>
                    <NeonBadge variant="success">Loop Lord</NeonBadge>
                    <NeonBadge variant="secondary">Syntax Slayer</NeonBadge>
                  </div>
                  <XPBar current={12450} max={15000} level={28} />
                </div>
              </div>
            </NeonCard>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <NeonCard variant="cyan">
              <div className="text-center">
                <div className="p-3 bg-primary/20 rounded-lg inline-block mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">12.4K</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            </NeonCard>

            <NeonCard variant="violet">
              <div className="text-center">
                <div className="p-3 bg-secondary/20 rounded-lg inline-block mb-2">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-1">156</div>
                <div className="text-xs text-muted-foreground">Challenges</div>
              </div>
            </NeonCard>

            <NeonCard variant="blue">
              <div className="text-center">
                <div className="p-3 bg-accent/20 rounded-lg inline-block mb-2">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent mb-1">45</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </NeonCard>

            <NeonCard variant="cyan">
              <div className="text-center">
                <div className="p-3 bg-primary/20 rounded-lg inline-block mb-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">94%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </NeonCard>
          </motion.div>

          {/* XP Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeonCard variant="cyan" glow>
              <h3 className="text-xl font-semibold mb-6">XP Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={xpHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
                  <XAxis dataKey="week" stroke="hsl(var(--foreground) / 0.5)" />
                  <YAxis stroke="hsl(var(--foreground) / 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeonCard variant="violet" glow>
              <h3 className="text-xl font-semibold mb-4">Recent Challenges</h3>
              <div className="space-y-3">
                {recentChallenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-secondary/20"
                  >
                    <div>
                      <div className="font-semibold">{challenge.title}</div>
                      <div className="text-sm text-muted-foreground">{challenge.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-bold">+{challenge.xp} XP</div>
                      <div className="text-xs text-green-400">✓ Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
