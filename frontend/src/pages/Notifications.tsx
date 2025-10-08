import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Bell, Zap, Trophy, Award, CheckCircle } from "lucide-react";

interface Notification {
  id: number;
  type: "xp" | "badge" | "challenge" | "leaderboard";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "xp",
    title: "XP Earned!",
    description: "You earned 150 XP from Array Reversal challenge",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "badge",
    title: "New Badge Unlocked!",
    description: "Loop Lord badge has been added to your collection",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: 3,
    type: "leaderboard",
    title: "Rank Update",
    description: "You've climbed to rank #10 in the weekly leaderboard!",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: 4,
    type: "challenge",
    title: "Daily Challenge Available",
    description: "New daily challenge: Binary Tree Traversal",
    timestamp: "3 days ago",
    read: true,
  },
  {
    id: 5,
    type: "xp",
    title: "Streak Bonus!",
    description: "+50 XP for maintaining 7-day streak",
    timestamp: "5 days ago",
    read: true,
  },
];

export default function Notifications() {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case "xp":
        return <Zap className="w-6 h-6 text-primary" />;
      case "badge":
        return <Award className="w-6 h-6 text-secondary" />;
      case "leaderboard":
        return <Trophy className="w-6 h-6 text-accent" />;
      case "challenge":
        return <Bell className="w-6 h-6 text-primary" />;
      default:
        return <Bell className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Notifications
          </h1>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.read).length} unread</p>
                  </div>
                </div>
                <NeonBadge variant="default">
                  {notifications.filter(n => !n.read).length} New
                </NeonBadge>
              </div>
            </NeonCard>
          </motion.div>

          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <NeonCard
                variant={!notif.read ? "cyan" : "default"}
                glow={!notif.read}
                className={`cursor-pointer ${notif.read ? "opacity-75" : ""}`}
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg self-start relative">
                    {getIcon(notif.type)}
                    {!notif.read && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold">{notif.title}</h3>
                      {notif.read && (
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.description}</p>
                    <p className="text-xs text-muted-foreground">{notif.timestamp}</p>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm pt-4"
          >
            <p>Stay updated with your coding journey</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
