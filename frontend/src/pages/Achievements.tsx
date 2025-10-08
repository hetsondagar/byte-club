import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Award, Lock, Loader2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiService } from "@/services/api";

interface Achievement {
  _id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  type: string;
  unlocked?: boolean;
  progress?: { current: number; total: number };
}

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch achievements from API
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching achievements from API...');
        
        const response = await apiService.getMeta('badge');
        console.log('Achievements response:', response);
        
        if (response.success && response.data?.items) {
          const achievementsData = response.data.items;
          
          // Get user's unlocked badges
          const userData = localStorage.getItem("byteclub_user");
          let unlockedBadges: string[] = [];
          
          if (userData) {
            try {
              const user = JSON.parse(userData);
              unlockedBadges = user.badges || [];
              console.log('User unlocked badges:', unlockedBadges);
            } catch (error) {
              console.log('Error parsing user data:', error);
            }
          } else {
            console.log('No user data found in localStorage');
          }
          
          // Get user stats for progress calculation
          let userStats = {
            challengesCompleted: 0,
            totalXP: 0,
            currentStreak: 0
          };
          
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              userStats = {
                challengesCompleted: parsedUser.completedChallenges?.length || 0,
                totalXP: parsedUser.totalXP || 0,
                currentStreak: parsedUser.currentStreak || 0,
              };
            } catch (error) {
              console.log('Error parsing user data for stats:', error);
            }
          }
          
          // Mark achievements as unlocked and calculate real progress
          const achievementsWithStatus = achievementsData.map(achievement => {
            const unlocked = unlockedBadges.includes(achievement.key);
            
            // Calculate progress based on achievement requirements
            let progress = undefined;
            if (!unlocked && achievement.requirements) {
              const req = achievement.requirements;
              
              if (req.challengesCompleted) {
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.challengesCompleted),
                  total: req.challengesCompleted
                };
              } else if (req.loopChallengesCompleted) {
                // Mock for now - would need to track specific challenge types
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.loopChallengesCompleted),
                  total: req.loopChallengesCompleted
                };
              } else if (req.syntaxErrorsFixed) {
                // Mock for now - would need to track syntax error fixes
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.syntaxErrorsFixed),
                  total: req.syntaxErrorsFixed
                };
              } else if (req.speedChallenges) {
                // Mock for now - would need to track speed challenges
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.speedChallenges),
                  total: req.speedChallenges
                };
              } else if (req.arrayChallenges) {
                // Mock for now - would need to track array challenges
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.arrayChallenges),
                  total: req.arrayChallenges
                };
              } else if (req.functionsWritten) {
                // Mock for now - would need to track functions written
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.functionsWritten),
                  total: req.functionsWritten
                };
              } else if (req.recursionProblems) {
                // Mock for now - would need to track recursion problems
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.recursionProblems),
                  total: req.recursionProblems
                };
              } else if (req.debuggingChallenges) {
                // Mock for now - would need to track debugging challenges
                progress = {
                  current: Math.min(userStats.challengesCompleted, req.debuggingChallenges),
                  total: req.debuggingChallenges
                };
              } else if (req.streakDays) {
                progress = {
                  current: Math.min(userStats.currentStreak, req.streakDays),
                  total: req.streakDays
                };
              }
            }
            
            return {
              ...achievement,
              unlocked,
              progress
            };
          });
          
          // Define achievement progression order (by difficulty/XP reward)
          const achievementOrder = [
            'first_steps',      // 50 XP - First achievement
            'loop_lord',        // 200 XP - Basic loops
            'syntax_slayer',    // 300 XP - Fix syntax errors
            'speed_demon',      // 400 XP - Speed challenges
            'array_ace',        // 500 XP - Array mastery
            'function_fury',    // 600 XP - Function writing
            'recursion_master', // 700 XP - Recursion
            'bug_exterminator', // 800 XP - Debugging
            'streak_keeper'     // 1000 XP - Long-term commitment
          ];
          
          // Sort achievements: unlocked first, then by progression order
          const sortedAchievements = achievementsWithStatus.sort((a, b) => {
            // First, sort by unlock status (unlocked first)
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            
            // Then sort by progression order
            const aIndex = achievementOrder.indexOf(a.key);
            const bIndex = achievementOrder.indexOf(b.key);
            
            // If both are in the order array, sort by position
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            
            // If only one is in the order array, prioritize it
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            // If neither is in the order array, maintain original order
            return 0;
          });
          
          setAchievements(sortedAchievements);
          console.log('Achievements loaded successfully:', sortedAchievements.length);
          console.log('User stats:', userStats);
          console.log('Unlocked achievements:', sortedAchievements.filter(a => a.unlocked).map(a => a.name));
          console.log('Locked achievements with progress:', sortedAchievements.filter(a => !a.unlocked).map(a => ({
            name: a.name,
            progress: a.progress ? `${a.progress.current}/${a.progress.total}` : 'No progress'
          })));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setError('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-lg">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
            <p className="text-lg mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Achievements
          </h1>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NeonCard
                        variant={achievement.unlocked ? "cyan" : "default"}
                        glow={achievement.unlocked}
                        className={`h-full transition-all duration-300 ${
                          achievement.unlocked 
                            ? "hover:scale-105 cursor-pointer" 
                            : "opacity-75"
                        }`}
                      >
                        <div className="p-6 text-center space-y-4">
                          <div className="text-4xl mb-2">
                            {achievement.unlocked ? achievement.icon : <Lock className="mx-auto h-8 w-8" />}
                          </div>
                          
                          <h3 className={`text-xl font-bold ${
                            achievement.unlocked ? "text-cyan-400" : "text-gray-400"
                          }`}>
                            {achievement.name}
                          </h3>
                          
                          <p className="text-sm text-gray-300">
                            {achievement.description}
                          </p>
                          
                          {achievement.unlocked ? (
                            <div className="flex items-center justify-center gap-2 text-yellow-400">
                              <Award className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                +{achievement.xpReward} XP
                              </span>
                            </div>
                          ) : achievement.progress ? (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-400">
                                Progress: {achievement.progress.current}/{achievement.progress.total}
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(achievement.progress.current / achievement.progress.total) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              Locked
                            </div>
                          )}
                        </div>
                      </NeonCard>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {achievement.unlocked 
                          ? `Unlocked! Earned ${achievement.xpReward} XP` 
                          : `Complete requirements to unlock and earn ${achievement.xpReward} XP`
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}