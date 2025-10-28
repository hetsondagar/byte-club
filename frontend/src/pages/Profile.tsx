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
import { computeLevelProgress } from "@/lib/xp";
import { loadUserStreak, getActualStreakStatus } from "@/lib/streak";

interface UserData {
  _id?: string;
  username?: string;
  email?: string;
  totalXP?: number;
  currentLevel?: number;
  currentStreak?: number;
  badges?: string[];
  rewards?: string[];
  role?: string;
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
            console.log('Profile - Raw userData from localStorage:', userData);
            // Ensure arrays exist
            if (!userData.badges) userData.badges = [];
            if (!userData.rewards) userData.rewards = [];
            if (!userData.completedChallenges) userData.completedChallenges = [];
            
            // Get actual streak status (checks if broken based on dates)
            const streakStatus = getActualStreakStatus();
            console.log('Profile - getActualStreakStatus() returned:', streakStatus);
            console.log('Profile - userData before streak update:', userData);
            userData.currentStreak = streakStatus.currentStreak;
            console.log('Profile - userData after streak update:', userData);
            
            setUserData(userData);
            
            // Load badges and rewards from user data
            console.log('Profile - Loading badges from userData:', userData.badges);
            setBadges(userData.badges || []);
            setRewards(userData.rewards || []);
            
            // Load recent challenges from localStorage
            loadRecentChallenges();
          } catch (parseError) {
            console.error('Failed to parse local user data:', parseError);
            navigate("/");
            return;
          }
        } else {
          navigate("/");
          return;
        }
        
      } finally {
        setLoading(false);
      }
    };

    const loadRecentChallenges = async () => {
      try {
        // Get recent challenges from localStorage
        const localUser = localStorage.getItem("byteclub_user");
        if (localUser) {
          const userData = JSON.parse(localUser);
          const completedChallenges = userData.completedChallenges || [];
          
          if (completedChallenges.length === 0) {
            setRecentChallenges([]);
            return;
          }
          
          // Try to get challenge details from API for better display
          try {
            const recentChallengesData = [];
            const recentSlugs = completedChallenges.slice(-5); // Get last 5 completed
            
            for (const slug of recentSlugs) {
              try {
                const challenge = await apiService.getChallenge(slug);
                recentChallengesData.push({
                  title: challenge.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  date: new Date(Date.now() - (recentSlugs.length - recentSlugs.indexOf(slug)) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                  xp: challenge.xpReward || Math.floor(Math.random() * 50) + 10,
                  slug: slug,
                  difficulty: challenge.difficulty || 'medium'
                });
              } catch (apiError) {
                // Fallback to basic data if API fails
                recentChallengesData.push({
                  title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  date: new Date(Date.now() - (recentSlugs.length - recentSlugs.indexOf(slug)) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                  xp: Math.floor(Math.random() * 50) + 10,
                  slug: slug,
                  difficulty: 'medium'
                });
              }
            }
            
            setRecentChallenges(recentChallengesData.reverse()); // Show most recent first
          } catch (error) {
            console.error('Error fetching challenge details:', error);
            // Fallback to basic data
            const recentChallengesData = completedChallenges.slice(-5).map((challengeSlug: string, index: number) => ({
              title: challengeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              date: new Date(Date.now() - (completedChallenges.length - index) * 24 * 60 * 60 * 1000).toLocaleDateString(),
              xp: Math.floor(Math.random() * 50) + 10,
              slug: challengeSlug,
              difficulty: 'medium'
            }));
            setRecentChallenges(recentChallengesData.reverse());
          }
        }
      } catch (error) {
        console.error('Error loading recent challenges:', error);
        setRecentChallenges([]);
      }
    };

    loadUserData();

    // Listen for streak migration events to refresh the display
    const handleStreakMigration = () => {
      const streakData = loadUserStreak();
      setUserData(prev => prev ? {
        ...prev,
        currentStreak: streakData.currentStreak
      } : null);
    };

    // Listen for challenge completion events to refresh recent challenges
    const handleChallengeCompleted = () => {
      loadRecentChallenges();
      // Also refresh user data to get updated completed challenges count
      const localUser = localStorage.getItem("byteclub_user");
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          const streakData = loadUserStreak();
          userData.currentStreak = streakData.currentStreak;
          setUserData(userData);
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    };

    window.addEventListener('streakMigrated', handleStreakMigration);
    window.addEventListener('challengeCompleted', handleChallengeCompleted);
    
    // Listen for badge updates
    const handleBadgeUpdate = () => {
      console.log('Profile - Badge update event received, reloading user data...');
      loadUserData();
    };
    window.addEventListener('badgeUpdated', handleBadgeUpdate);
    
    return () => {
      window.removeEventListener('streakMigrated', handleStreakMigration);
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
      window.removeEventListener('badgeUpdated', handleBadgeUpdate);
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
      {(() => {
        const { level } = computeLevelProgress(userData.totalXP || 0);
        return <Navbar username={userData.username || 'Hacker'} level={level} xp={userData.totalXP || 0} onLogout={handleLogout} />
      })()}

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
                  {userData?.username && userData.username.length > 0 ? userData.username[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{userData?.username || 'Hacker'}</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {userData?.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Level {userData?.currentLevel || 0} • {userData?.totalXP || 0} XP
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <NeonBadge variant="success" className="animate-pulse">
                      <Flame className="w-3 h-3 mr-1" />
                      {(() => {
                        const streakStatus = getActualStreakStatus();
                        const streak = streakStatus.currentStreak;
                        return streak === 0 ? "No Streak" : `${streak} Day Streak`;
                      })()}
                    </NeonBadge>
                    {badges && badges.length > 0 ? (
                      badges.slice(0, 3).map((badge, index) => (
                        <NeonBadge key={index} variant="default" className="hover:scale-105 transition-transform">
                          {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </NeonBadge>
                      ))
                    ) : (
                      <NeonBadge variant="secondary" className="opacity-75">
                        No badges yet
                      </NeonBadge>
                    )}
                    {badges && badges.length > 3 && (
                      <NeonBadge variant="secondary" className="text-xs">
                        +{badges.length - 3} more
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
              {userData ? (() => {
                const { level, currentXP, requiredXP } = computeLevelProgress(userData.totalXP || 0);
                return (
                  <XPBar 
                    current={currentXP} 
                    max={requiredXP} 
                    level={level} 
                  />
                );
              })() : (
                <XPBar current={0} max={100} level={1} />
              )}
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
                <div className="text-4xl font-bold text-secondary mb-2">{badges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Badges Unlocked</div>
              </div>
            </NeonCard>
            <NeonCard variant="blue">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{userData.currentStreak || 0}</div>
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
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-white">{challenge.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{challenge.date}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-bold">+{challenge.xp} XP</div>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <span>✓</span>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent challenges completed yet.</p>
                    <p className="text-sm">Start solving challenges to see your progress here!</p>
                    <Button 
                      onClick={() => navigate('/challenges')} 
                      className="mt-4"
                      variant="outline"
                    >
                      Browse Challenges
                    </Button>
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
