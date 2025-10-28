import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { XPBar } from "@/components/ui/xp-bar";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Trophy, Zap, Award, TrendingUp, Flame, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiService } from "@/services/api";
import { computeLevelProgress } from "@/lib/xp";
import { toast } from "sonner";

export default function LeaderboardDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([]);
  
  // Get userId and entryData from navigation state, or try to fetch by username
  const userId = (location.state as any)?.userId;
  const entryData = (location.state as any)?.entryData;

  const loadCompletedChallenges = async (challengeSlugs: string[]) => {
    console.log('🔍 Loading completed challenges, slugs:', challengeSlugs);
    
    if (!challengeSlugs || challengeSlugs.length === 0) {
      console.log('⚠️ No challenge slugs provided');
      setCompletedChallenges([]);
      return;
    }
    
    try {
      // Fetch all challenges to match with completed ones
      console.log('📡 Fetching all challenges from API...');
      const allChallenges = await apiService.getChallenges();
      console.log('✅ Fetched challenges:', allChallenges?.length || 0);
      console.log('📋 Sample challenge:', allChallenges?.[0]);
      
      // Filter and map completed challenges
      const completed = challengeSlugs
        .map((slug: string) => {
          const challenge = allChallenges.find((c: any) => c.slug === slug);
          console.log(`🔍 Looking for slug "${slug}":`, challenge ? 'Found' : 'Not found');
          if (challenge) {
            return {
              title: challenge.title || slug,
              slug: slug,
              xp: challenge.xpReward || challenge.xp || 0,
              type: challenge.type || 'code'
            };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, 10); // Show last 10 completed challenges
      
      console.log('✅ Completed challenges loaded:', completed.length);
      console.log('📋 Completed challenges:', completed);
      setCompletedChallenges(completed as any[]);
    } catch (error) {
      console.error("❌ Error loading completed challenges:", error);
      setCompletedChallenges([]);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // If we have entryData from leaderboard, use it but fetch full user data if challenges missing
        if (entryData) {
          console.log('📊 Using entryData:', entryData);
          console.log('📋 EntryData completedChallenges:', entryData.completedChallenges);
          
          const levelData = computeLevelProgress(entryData.totalXP || 0);
          let challenges = entryData.completedChallenges || [];
          
          // If no completedChallenges in entryData, fetch full user data
          if (!challenges || challenges.length === 0) {
            console.log('⚠️ No completedChallenges in entryData, fetching full user data...');
            try {
              const fullUser = await apiService.getUser(entryData._id);
              challenges = fullUser.completedChallenges || [];
              console.log('✅ Fetched full user data, completedChallenges:', challenges);
              
              // Update userData with full user data
              setUserData({
                ...fullUser,
                currentLevel: levelData.level,
                badges: Array.isArray(fullUser.badges) ? fullUser.badges : []
              });
            } catch (err) {
              console.error('Error fetching full user data:', err);
              setUserData({
                ...entryData,
                currentLevel: levelData.level,
                badges: Array.isArray(entryData.badges) ? entryData.badges : []
              });
            }
          } else {
            setUserData({
              ...entryData,
              currentLevel: levelData.level,
              badges: Array.isArray(entryData.badges) ? entryData.badges : []
            });
          }
          
          // Load challenge details for completed challenges
          console.log('🎯 About to load challenges:', challenges);
          await loadCompletedChallenges(challenges);
          setLoading(false);
          return;
        }
        
        // If we have userId, fetch user data
        if (userId) {
          console.log('📡 Fetching user data for userId:', userId);
          const user = await apiService.getUser(userId);
          console.log('✅ Fetched user:', user);
          console.log('📋 User completedChallenges:', user.completedChallenges);
          
          const levelData = computeLevelProgress(user.totalXP || 0);
          setUserData({
            ...user,
            currentLevel: levelData.level
          });
          
          // Load challenge details for completed challenges
          const challenges = user.completedChallenges || [];
          console.log('🎯 About to load challenges:', challenges);
          await loadCompletedChallenges(challenges);
          setLoading(false);
          return;
        }
        
        // If no data available, show error
        toast.error("User data not available");
        navigate("/leaderboard");
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user profile");
        navigate("/leaderboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username, userId, entryData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Navbar />
        <FloatingParticles count={20} />
        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Navbar />
        <FloatingParticles count={20} />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => navigate("/leaderboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leaderboard
          </Button>
          <NeonCard variant="cyan" className="mt-8 text-center py-12">
            <p className="text-muted-foreground">User not found</p>
          </NeonCard>
        </div>
      </div>
    );
  }

  const levelData = computeLevelProgress(userData.totalXP || 0);
  const badges = Array.isArray(userData.badges) ? userData.badges : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
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
                  {userData.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-3">{userData.username || "User"}</h2>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {badges.length > 0 && badges.slice(0, 3).map((badge: string, index: number) => (
                      <NeonBadge key={index} variant="success">
                        {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </NeonBadge>
                    ))}
                    {userData.currentStreak > 0 && (
                      <NeonBadge variant="default">
                        <Flame className="w-3 h-3 mr-1" />
                        {userData.currentStreak} Day Streak
                      </NeonBadge>
                    )}
                  </div>
                  <XPBar current={levelData.currentXP} max={levelData.requiredXP} level={levelData.level} />
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
                <div className="text-3xl font-bold text-primary mb-1">
                  {userData.totalXP >= 1000 ? `${(userData.totalXP / 1000).toFixed(1)}K` : userData.totalXP}
                </div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            </NeonCard>

            <NeonCard variant="violet">
              <div className="text-center">
                <div className="p-3 bg-secondary/20 rounded-lg inline-block mb-2">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-1">
                  {userData.completedChallenges?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Challenges</div>
              </div>
            </NeonCard>

            <NeonCard variant="blue">
              <div className="text-center">
                <div className="p-3 bg-accent/20 rounded-lg inline-block mb-2">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent mb-1">{badges.length}</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </NeonCard>

            <NeonCard variant="cyan">
              <div className="text-center">
                <div className="p-3 bg-primary/20 rounded-lg inline-block mb-2">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{userData.currentStreak || 0}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </NeonCard>
          </motion.div>

          {/* Badges Display */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NeonCard variant="violet" glow>
                <h3 className="text-xl font-semibold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge: string, index: number) => (
                    <NeonBadge key={index} variant="default" className="text-sm">
                      {badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </NeonBadge>
                  ))}
                </div>
              </NeonCard>
            </motion.div>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NeonCard variant="cyan" glow>
                <h3 className="text-xl font-semibold mb-4">Recent Challenges</h3>
                <div className="space-y-3">
                  {completedChallenges.map((challenge: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/challenges/${challenge.slug}`)}
                    >
                      <div>
                        <div className="font-semibold">{challenge.title}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {challenge.type || 'code'} challenge
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-bold">+{challenge.xp} XP</div>
                        <div className="text-xs text-green-400">✓ Completed</div>
                      </div>
                    </div>
                  ))}
                </div>
                {userData.completedChallenges?.length > completedChallenges.length && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    +{userData.completedChallenges.length - completedChallenges.length} more challenges completed
                  </div>
                )}
              </NeonCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
