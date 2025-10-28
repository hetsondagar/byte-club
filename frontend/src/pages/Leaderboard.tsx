import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award, Flame, Star } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { loadUserStreak, getActualStreakStatus } from "@/lib/streak";
import { computeLevelProgress } from "@/lib/xp";

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalXP: number;
  currentLevel: number;
  badges: string[];
  currentStreak: number;
  _id: string;
}

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

export default function Leaderboard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<"alltime" | "challenges" | "adventure" | "quests">("alltime");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [challengesData, setChallengesData] = useState<LeaderboardEntry[]>([]);
  const [adventureData, setAdventureData] = useState<LeaderboardEntry[]>([]);
  const [questsData, setQuestsData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

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
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user data with frontend streak and level
        const localUser = localStorage.getItem("byteclub_user");
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            // Get actual streak status (checks if broken based on dates)
            const streakStatus = getActualStreakStatus();
            // Calculate level from XP
            const levelData = computeLevelProgress(userData.totalXP || 0);
            
            userData.currentStreak = streakStatus.currentStreak;
            userData.currentLevel = levelData.level;
            
            // Update localStorage with the correct data
            localStorage.setItem("byteclub_user", JSON.stringify(userData));
            console.log('Updated localStorage with frontend data:');
            console.log('  Streak:', streakData.currentStreak);
            console.log('  Level:', levelData.level);
            
            setUserData(userData);
          } catch (parseError) {
            console.error('Failed to parse local user data:', parseError);
          }
        }
        
        // Fetch leaderboard data from API
        try {
          const [allTimeData, challengesData, adventureData, questsData] = await Promise.all([
            apiService.getLeaderboard('all-time'),
            apiService.getLeaderboard('challenges'),
            apiService.getLeaderboard('adventure'),
            apiService.getLeaderboard('quests')
          ]);
          
          console.log('Raw API responses:');
          console.log('All-time data:', allTimeData);
          console.log('Challenges data:', challengesData);
          console.log('Adventure data:', adventureData);
          console.log('Quests data:', questsData);
          
          // Ensure data is properly formatted
          const formatLeaderboardData = (data: any[]) => {
            if (!Array.isArray(data)) {
              console.error('Leaderboard data is not an array:', data);
              return [];
            }
            
            console.log('Raw leaderboard data:', data);
            
            return data.map((entry, index) => {
              const formattedEntry = {
                _id: entry._id || `entry-${index}`,
                username: entry.username || 'Unknown User',
                totalXP: entry.totalXP || 0,
                currentLevel: entry.currentLevel || 1,
                currentStreak: entry.currentStreak || 0,
                badges: Array.isArray(entry.badges) ? entry.badges : [],
                completedChallenges: Array.isArray(entry.completedChallenges) ? entry.completedChallenges : [],
                rank: entry.rank || index + 1
              };
              
              console.log(`Formatted entry ${index}:`, formattedEntry);
              return formattedEntry;
            });
          };
          
          // Format data and update ALL users' streak and level from frontend system
          const currentUser = userData?.username;
          const updateAllUsersData = (data: any[]) => {
            return data.map(entry => {
              // For weekly/monthly, use lifetimeXP for level calculation if available
              const xpForLevel = entry.lifetimeXP || entry.totalXP || 0;
              const levelData = computeLevelProgress(xpForLevel);
              
              // For current user, get actual streak status (checks if broken)
              if (entry.username === currentUser) {
                const streakStatus = getActualStreakStatus();
                
                console.log(`Updating current user data:`);
                console.log(`  Streak: ${entry.currentStreak} -> ${streakStatus.currentStreak} (isBroken: ${streakStatus.isBroken})`);
                console.log(`  Level: ${entry.currentLevel} -> ${levelData.level} (from ${xpForLevel} XP)`);
                
                // Get badges from localStorage
                const localUser = localStorage.getItem("byteclub_user");
                let frontendBadges = entry.badges || [];
                if (localUser) {
                  try {
                    const userData = JSON.parse(localUser);
                    frontendBadges = userData.badges || [];
                    console.log(`  Badges: ${entry.badges?.length || 0} -> ${frontendBadges.length}`);
                  } catch (error) {
                    console.error('Error getting badges from localStorage:', error);
                  }
                }
                
                // Force update the entry with frontend data
                const updatedEntry = {
                  ...entry,
                  currentStreak: streakStatus.currentStreak,
                  currentLevel: levelData.level,
                  badges: frontendBadges
                };
                
                // Also update localStorage to ensure consistency
                if (localUser) {
                  try {
                    const userData = JSON.parse(localUser);
                    userData.currentStreak = streakStatus.currentStreak;
                    userData.currentLevel = levelData.level;
                    userData.badges = frontendBadges;
                    localStorage.setItem("byteclub_user", JSON.stringify(userData));
                  } catch (error) {
                    console.error('Error updating localStorage data:', error);
                  }
                }
                
                return updatedEntry;
              } else {
                // For other users, use their actual data from backend
                // Don't modify their streaks - use what the backend provides
                console.log(`Using other user ${entry.username} data from backend:`);
                console.log(`  Streak: ${entry.currentStreak || 0}`);
                console.log(`  Level: ${entry.currentLevel || levelData.level}`);
                
                return {
                  ...entry,
                  currentStreak: entry.currentStreak || 0, // Use actual backend value
                  currentLevel: entry.currentLevel || levelData.level,
                  badges: Array.isArray(entry.badges) ? entry.badges : []
                };
              }
            });
          };
          
          const formattedAllTime = updateAllUsersData(formatLeaderboardData(allTimeData));
          const formattedChallenges = updateAllUsersData(formatLeaderboardData(challengesData));
          const formattedAdventure = updateAllUsersData(formatLeaderboardData(adventureData));
          const formattedQuests = updateAllUsersData(formatLeaderboardData(questsData));
          
          console.log('Formatted data:');
          console.log('All-time formatted:', formattedAllTime);
          console.log('Challenges formatted:', formattedChallenges);
          console.log('Adventure formatted:', formattedAdventure);
          console.log('Quests formatted:', formattedQuests);
          
          setLeaderboardData(formattedAllTime);
          setChallengesData(formattedChallenges);
          setAdventureData(formattedAdventure);
          setQuestsData(formattedQuests);
          
        } catch (error) {
          console.error('Failed to fetch leaderboard data:', error);
          toast.error('Failed to load leaderboard data');
          
          // Fallback to empty data
          setLeaderboardData([]);
          setChallengesData([]);
          setAdventureData([]);
          setQuestsData([]);
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();

    // Listen for streak updates and challenge completions
    const handleStreakUpdate = () => {
      console.log('Streak update detected, refreshing leaderboard data');
      fetchLeaderboardData();
    };

    const handleChallengeCompleted = () => {
      console.log('Challenge completed, refreshing leaderboard data');
      fetchLeaderboardData();
    };

    window.addEventListener('streakMigrated', handleStreakUpdate);
    window.addEventListener('challengeCompleted', handleChallengeCompleted);
    
    // Listen for badge updates
    const handleBadgeUpdate = () => {
      console.log('Leaderboard - Badge update event received, refreshing leaderboard data');
      fetchLeaderboardData();
    };
    window.addEventListener('badgeUpdated', handleBadgeUpdate);
    
    return () => {
      window.removeEventListener('streakMigrated', handleStreakUpdate);
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
      window.removeEventListener('badgeUpdated', handleBadgeUpdate);
    };
  }, []);

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
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      {/* Navbar */}
      <Navbar 
        username={userData?.username || username} 
        level={userData?.currentLevel || 1} 
        xp={userData?.totalXP || 0} 
        onLogout={handleLogout} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">Top hackers in the realm</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="alltime" className="mb-8" onValueChange={(v) => setCategory(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alltime">All Time</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="adventure">Adventure</TabsTrigger>
              <TabsTrigger value="quests">Quests</TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="space-y-4 mt-8">
              {(() => {
                const currentData = category === 'challenges' ? challengesData : 
                                  category === 'adventure' ? adventureData : 
                                  category === 'quests' ? questsData : 
                                  leaderboardData;
                const currentUser = userData?.username;
                
                // Ensure currentData is always an array
                if (!Array.isArray(currentData)) {
                  console.error('currentData is not an array:', currentData);
                  return (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Error loading leaderboard data</p>
                    </div>
                  );
                }
                
                if (currentData.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {category === 'challenges' ? 'No challenge completions yet' :
                         category === 'adventure' ? 'No adventure nodes completed yet' :
                         category === 'quests' ? 'No quest missions completed yet' :
                         'No leaderboard data available'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {category === 'challenges' ? 'Complete some challenges to appear on the leaderboard!' :
                         category === 'adventure' ? 'Explore the adventure map to earn XP!' :
                         category === 'quests' ? 'Complete quest missions to climb the ranks!' :
                         'Start your coding journey to appear here!'}
                      </p>
                    </div>
                  );
                }
                
                return currentData.map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NeonCard
                      variant={getRankColor(entry.rank || 1) as any}
                      glow={(entry.rank || 1) <= 3}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${entry.username === currentUser ? "border-primary border-2 shadow-lg shadow-primary/20" : ""}`}
                      onClick={() => {
                        // Pass both username and userId for profile lookup
                        navigate(`/leaderboard/${entry.username || 'unknown'}`, { 
                          state: { userId: entry._id, entryData: entry } 
                        });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 flex justify-center">
                            {getRankIcon(entry.rank || 1)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-white">
                                {entry.username || 'Unknown User'}
                              </h3>
                              {entry.username === currentUser && (
                                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                <span>Level {entry.currentLevel || 1}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>{Array.isArray(entry.badges) ? entry.badges.length : 0} badges</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-400" />
                                <span>{entry.currentStreak || 0} day streak</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {(entry.totalXP || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">XP</div>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                ));
              })()}
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
