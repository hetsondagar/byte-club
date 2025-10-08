import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, User, Mail, Calendar, Flame, Target, Award } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface UserData {
  _id: string;
  username: string;
  email: string;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  badges: string[];
  rewards: string[];
  role: string;
  completedChallenges?: string[];
}

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  // Get username from user data
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

  useEffect(() => {
    const loadUserData = () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const localUser = localStorage.getItem("byteclub_user");
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            setUserData(userData);
          } catch (parseError) {
            console.error('Failed to parse local user data:', parseError);
            navigate("/");
            return;
          }
        } else {
          navigate("/");
          return;
        }
        
        // Set empty arrays for now (we'll implement API calls later)
        setBadges([]);
        setRewards([]);
        setRecentChallenges([]);
        
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("byteclub_user");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles count={20} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles count={20} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load profile data</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      {/* Navbar */}
      <Navbar username={userData.username} level={userData.currentLevel} xp={userData.totalXP} onLogout={handleLogout} />

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
                  {userData.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{userData.username}</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {userData.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Level {userData.currentLevel} • {userData.totalXP} XP
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <NeonBadge variant="success" className="animate-pulse">
                      <Flame className="w-3 h-3 mr-1" />
                      {userData.currentStreak} Day Streak
                    </NeonBadge>
                    {userData.badges.length > 0 ? (
                      userData.badges.slice(0, 3).map((badge, index) => (
                        <NeonBadge key={index} variant="default" className="hover:scale-105 transition-transform">
                          {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </NeonBadge>
                      ))
                    ) : (
                      <NeonBadge variant="secondary" className="opacity-75">
                        No badges yet
                      </NeonBadge>
                    )}
                    {userData.badges.length > 3 && (
                      <NeonBadge variant="secondary" className="text-xs">
                        +{userData.badges.length - 3} more
                      </NeonBadge>
                    )}
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
              <XPBar 
                current={userData.totalXP} 
                max={userData.currentLevel * 500} 
                level={userData.currentLevel} 
              />
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
                <div className="text-4xl font-bold text-primary mb-2">{userData.completedChallenges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Challenges Completed</div>
              </div>
            </NeonCard>
            <NeonCard variant="violet">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">{userData.badges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Unlocked</div>
              </div>
            </NeonCard>
            <NeonCard variant="blue">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{userData.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
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
                {recentChallenges.length > 0 ? (
                  recentChallenges.map((challenge, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent challenges completed yet.</p>
                    <p className="text-sm">Start solving challenges to see your progress here!</p>
                  </div>
                )}
              </div>
            </NeonCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
