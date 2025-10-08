import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, TrendingUp, Target, Zap, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const weeklyData = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 180 },
  { day: "Wed", xp: 240 },
  { day: "Thu", xp: 160 },
  { day: "Fri", xp: 300 },
  { day: "Sat", xp: 220 },
  { day: "Sun", xp: 280 },
];

const accuracyData = [
  { month: "Jan", rate: 75 },
  { month: "Feb", rate: 78 },
  { month: "Mar", rate: 82 },
  { month: "Apr", rate: 85 },
  { month: "May", rate: 87 },
];

export default function Stats() {
  const navigate = useNavigate();
  const username = localStorage.getItem("byteclub_user") || "Hacker";

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
            Statistics
          </h1>
          <p className="text-muted-foreground mt-2">Your performance analytics</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <NeonCard variant="cyan" glow>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">42</div>
                    <div className="text-sm text-muted-foreground">Attempted</div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <NeonCard variant="violet" glow>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2,450</div>
                    <div className="text-sm text-muted-foreground">Total XP</div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <NeonCard variant="blue" glow>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">87%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <NeonCard variant="cyan" glow>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">7</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          </div>

          {/* Weekly XP Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <NeonCard variant="cyan" glow>
              <h3 className="text-xl font-semibold mb-6">Weekly XP Earned</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
                  <XAxis dataKey="day" stroke="hsl(var(--foreground) / 0.5)" />
                  <YAxis stroke="hsl(var(--foreground) / 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>

          {/* Accuracy Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <NeonCard variant="violet" glow>
              <h3 className="text-xl font-semibold mb-6">Accuracy Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary) / 0.1)" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground) / 0.5)" />
                  <YAxis stroke="hsl(var(--foreground) / 0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--secondary) / 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ fill: "hsl(var(--secondary))", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
