import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, User, Mail, Calendar, Flame, Target, Award } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const username = localStorage.getItem("byteclub_user") || "Hacker";

  const recentChallenges = [
    { title: "Array Reversal", xp: 150, date: "2 days ago", status: "completed" },
    { title: "Binary Search", xp: 200, date: "5 days ago", status: "completed" },
    { title: "Palindrome Checker", xp: 150, date: "1 week ago", status: "completed" },
  ];

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-muted-foreground mt-2">Hacker stats and achievements</p>
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
                  {username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{username}</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {username.toLowerCase()}@byteclub.dev
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined 3 months ago
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <NeonBadge variant="success">
                      <Flame className="w-3 h-3 mr-1" />
                      7 Day Streak
                    </NeonBadge>
                    <NeonBadge variant="default">Loop Lord</NeonBadge>
                    <NeonBadge variant="secondary">Syntax Slayer</NeonBadge>
                  </div>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeonCard variant="violet" glow>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progress
              </h3>
              <XPBar current={2450} max={5000} level={12} />
            </NeonCard>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <NeonCard variant="cyan">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">42</div>
                <div className="text-sm text-muted-foreground">Challenges Completed</div>
              </div>
            </NeonCard>
            <NeonCard variant="violet">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">8</div>
                <div className="text-sm text-muted-foreground">Badges Unlocked</div>
              </div>
            </NeonCard>
            <NeonCard variant="blue">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">87%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </NeonCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeonCard variant="cyan" glow>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Challenges
              </h3>
              <div className="space-y-3">
                {recentChallenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20"
                  >
                    <div>
                      <div className="font-semibold">{challenge.title}</div>
                      <div className="text-sm text-muted-foreground">{challenge.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold">+{challenge.xp} XP</div>
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
