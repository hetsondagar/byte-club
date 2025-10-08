import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

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
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("alltime");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<LeaderboardEntry[]>([]);
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
        
        // Get current user data
        const localUser = localStorage.getItem("byteclub_user");
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            setUserData(userData);
          } catch (parseError) {
            console.error('Failed to parse local user data:', parseError);
          }
        }
        
        // Fetch leaderboard data from API
        try {
          const [allTimeData, weeklyData] = await Promise.all([
            apiService.getLeaderboard('all-time'),
            apiService.getLeaderboard('weekly')
          ]);
          
          setLeaderboardData(allTimeData);
          setWeeklyData(weeklyData);
          
        } catch (error) {
          console.error('Failed to fetch leaderboard data:', error);
          toast.error('Failed to load leaderboard data');
          
          // Fallback to empty data
          setLeaderboardData([]);
          setWeeklyData([]);
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
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
          <Tabs defaultValue="alltime" className="mb-8" onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-4 mt-8">
              {(() => {
                const currentData = timeframe === 'weekly' ? weeklyData : leaderboardData;
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
                      <p className="text-muted-foreground">No leaderboard data available</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {timeframe === 'weekly' ? 'Weekly data will appear here' : 'All-time data will appear here'}
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
                      className={`cursor-pointer ${entry.username === currentUser ? "border-primary border-2" : ""}`}
                      onClick={() => navigate(`/leaderboard/${entry.username || 'unknown'}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 flex justify-center">
                            {getRankIcon(entry.rank || 1)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {entry.username || 'Unknown User'}
                              {entry.username === currentUser && (
                                <span className="ml-2 text-xs text-primary">(You)</span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Level {entry.currentLevel || 1} • {entry.badges?.length || 0} badges • {entry.currentStreak || 0} day streak
                            </p>
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
