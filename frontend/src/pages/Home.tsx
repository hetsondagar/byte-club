import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { FloatingParticles } from "@/components/ui/floating-particles";
import {
  Map,
  Target,
  Trophy,
  User,
  BarChart3,
  Award,
  BookOpen,
  Settings,
  Calendar,
  Scroll,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navCards = [
  { title: "Adventure Map", icon: Map, path: "/adventure-map", color: "cyan", description: "Navigate the code realm" },
  { title: "Challenges", icon: Target, path: "/challenges", color: "violet", description: "Test your skills" },
  { title: "Leaderboard", icon: Trophy, path: "/leaderboard", color: "blue", description: "Top hackers" },
  { title: "Profile", icon: User, path: "/profile", color: "cyan", description: "Your stats" },
  { title: "Stats", icon: BarChart3, path: "/stats", color: "violet", description: "Analytics dashboard" },
  { title: "Achievements", icon: Award, path: "/achievements", color: "blue", description: "Unlock badges" },
  { title: "Tutorial", icon: BookOpen, path: "/tutorial", color: "cyan", description: "Learn the ropes" },
  { title: "Settings", icon: Settings, path: "/settings", color: "violet", description: "Customize" },
  { title: "Daily Challenge", icon: Calendar, path: "/daily-challenge", color: "blue", description: "Today's mission" },
  { title: "Quests", icon: Scroll, path: "/quests", color: "cyan", description: "Story missions" },
];

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Hacker");

  useEffect(() => {
    const user = localStorage.getItem("byteclub_user");
    if (!user) {
      navigate("/");
    } else {
      setUsername(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("byteclub_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={25} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to Byte Club,
            </span>
            <br />
            <span className="text-primary">{username}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Welcome to the code realm</p>
        </motion.div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <NeonCard variant="cyan" glow>
            <XPBar current={2450} max={5000} level={12} />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <NeonBadge variant="success">🔥 7 Day Streak</NeonBadge>
                <NeonBadge variant="default">Loop Lord</NeonBadge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </NeonCard>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {navCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link to={card.path}>
                  <NeonCard
                    variant={card.color as any}
                    glow
                    className="group cursor-pointer h-full backdrop-blur-sm bg-card/80"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                      </div>
                    </div>
                  </NeonCard>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-muted-foreground text-sm"
        >
          <p>"Every byte counts in the digital realm"</p>
        </motion.div>
      </div>
    </div>
  );
}
