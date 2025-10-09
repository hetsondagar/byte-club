import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { XPBar } from "@/components/ui/xp-bar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { getDailyFact } from "@/data/cseFacts";
import { apiService } from "@/services/api";
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
  Lightbulb,
  Sparkles,
} from "lucide-react";

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
}

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dailyFact, setDailyFact] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data from backend...');
      const response = await apiService.getCurrentUser();
      console.log('Fresh user data from backend:', response);
      
      // Handle nested response structure
      const freshUserData = (response as any).user || response;
      console.log('Extracted user data:', freshUserData);
      
      // Ensure required fields exist
      const safeUserData = {
        _id: freshUserData._id || "unknown",
        username: freshUserData.username || "Hacker",
        email: freshUserData.email || "user@example.com",
        totalXP: freshUserData.totalXP || 0,
        currentLevel: freshUserData.currentLevel || 1,
        currentStreak: freshUserData.currentStreak || 0,
        badges: freshUserData.badges || [],
        rewards: freshUserData.rewards || [],
        role: freshUserData.role || "user"
      };
      
      // Update localStorage with fresh data
      localStorage.setItem("byteclub_user", JSON.stringify(safeUserData));
      
      // Update state
      setUserData(safeUserData);
      
      console.log('User data refreshed successfully:', safeUserData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const localUser = localStorage.getItem("byteclub_user");
        
        if (localUser) {
          try {
            const parsedData = JSON.parse(localUser);
            // Handle both nested and direct user data structures
            const userData = parsedData.user || parsedData;
            // Ensure required fields exist
            const safeUserData = {
              _id: userData._id || "unknown",
              username: userData.username || "Hacker",
              email: userData.email || "user@example.com",
              totalXP: userData.totalXP || 0,
              currentLevel: userData.currentLevel || 1,
              currentStreak: userData.currentStreak || 0,
              badges: userData.badges || [],
              rewards: userData.rewards || [],
              role: userData.role || "user"
            };
            console.log('Home page user data:', safeUserData);
            setUserData(safeUserData);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            navigate("/");
            return;
          }
        } else {
          navigate("/");
          return;
        }
        
        setDailyFact(getDailyFact());
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();

    // Listen for localStorage changes to refresh user data
    const handleStorageChange = () => {
      console.log('Storage changed, refreshing user data...');
      loadUserData();
    };

    // Listen for our custom challenge completion event
    const handleChallengeCompleted = () => {
      console.log('Challenge completed, refreshing user data...');
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('challengeCompleted', handleChallengeCompleted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
    };
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
        <FloatingParticles count={25} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles count={25} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load user data</p>
            <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-primary text-white rounded">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={25} />

      {/* Navbar */}
      <Navbar username={userData.username} level={userData.currentLevel} xp={userData.totalXP} onLogout={handleLogout} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to the Digital Realm,
            </span>
            <br />
            <span className="text-primary text-3xl md:text-4xl">{userData.username}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Your hacker dashboard awaits</p>
        </motion.div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <NeonCard variant="cyan" glow>
            <XPBar 
              current={userData.totalXP} 
              max={userData.currentLevel * 500} 
              level={userData.currentLevel} 
            />
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <NeonBadge variant="success" className="animate-pulse">
                🔥 {userData.currentStreak} Day Streak
              </NeonBadge>
              {userData.badges && userData.badges.length > 0 ? (
                userData.badges.slice(0, 2).map((badge, index) => (
                  <NeonBadge key={index} variant="default" className="hover:scale-105 transition-transform">
                    {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </NeonBadge>
                ))
              ) : (
                <NeonBadge variant="secondary" className="opacity-75">
                  No badges yet
                </NeonBadge>
              )}
              {userData.badges && userData.badges.length > 2 && (
                <NeonBadge variant="secondary" className="text-xs">
                  +{userData.badges.length - 2} more
                </NeonBadge>
              )}
            </div>
          </NeonCard>
        </motion.div>

        {/* Mission Control - Navigation Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mission Control
            </span>
            <div className="w-1 h-8 bg-gradient-to-b from-secondary to-accent rounded-full" />
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {navCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
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

        {/* Daily CS Fact/Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <NeonCard variant="violet" glow className="relative overflow-hidden">
            {/* Animated Background Accent */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Lightbulb className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Daily Byte of Wisdom
                  </span>
                  <Sparkles className="w-4 h-4 text-secondary" />
                </h3>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 text-6xl text-primary/20 font-serif">"</div>
                <div className="absolute -right-4 bottom-0 text-6xl text-secondary/20 font-serif">"</div>
                
                <p className="text-base md:text-lg text-foreground px-6 py-2 leading-relaxed">
                  {dailyFact}
                </p>
              </motion.div>

              <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Today's insight
                </span>
                <span className="font-mono">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-transparent blur-2xl pointer-events-none" />
          </NeonCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-8 text-muted-foreground text-sm"
        >
          <p>"Every byte counts in the digital realm"</p>
        </motion.div>
      </div>
    </div>
  );
}
