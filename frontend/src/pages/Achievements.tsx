import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, Award, Lock, Loader2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiService } from "@/services/api";
import { computeLevelProgress } from "@/lib/xp";
import { loadUserStreak } from "@/lib/streak";
import { toast } from "sonner";

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

  // Function to manually trigger badge checking
  const triggerBadgeCheck = async () => {
    try {
      console.log('Triggering badge check...');
      
      // First, let's manually check and unlock badges based on current user data
      const userData = localStorage.getItem("byteclub_user");
      if (userData) {
        const user = JSON.parse(userData);
        const currentBadges = user.badges || [];
        const newBadges = [];
        
        console.log('Current user data:', {
          totalXP: user.totalXP,
          currentStreak: user.currentStreak,
          completedChallenges: user.completedChallenges?.length || 0,
          currentBadges: currentBadges.length
        });
        
        // Check XP Novice badge (12,000 XP)
        if (user.totalXP >= 12000 && !currentBadges.includes('xp_novice')) {
          newBadges.push('xp_novice');
          console.log('✅ XP Novice badge should be unlocked!');
        }
        
        // Check XP Warrior badge (25,000 XP)
        if (user.totalXP >= 25000 && !currentBadges.includes('xp_warrior')) {
          newBadges.push('xp_warrior');
          console.log('✅ XP Warrior badge should be unlocked!');
        }
        
        // Check XP Legend badge (50,000 XP)
        if (user.totalXP >= 50000 && !currentBadges.includes('xp_legend')) {
          newBadges.push('xp_legend');
          console.log('✅ XP Legend badge should be unlocked!');
        }
        
        // Check XP God badge (100,000 XP)
        if (user.totalXP >= 100000 && !currentBadges.includes('xp_god')) {
          newBadges.push('xp_god');
          console.log('✅ XP God badge should be unlocked!');
        }
        
        // Check Quantum Vault Breaker badge (check actual quest completion)
        const questProgress = localStorage.getItem(`byte_club_quest_progress_${user._id || user.id || 'anonymous'}`);
        if (questProgress) {
          try {
            const questData = JSON.parse(questProgress);
            const completedQuests = questData.completed || [];
            const quantumVaultCompleted = completedQuests.includes('quest-1');
            
            if (quantumVaultCompleted && !currentBadges.includes('quantum_vault_breaker')) {
              newBadges.push('quantum_vault_breaker');
              console.log('✅ Quantum Vault Breaker badge should be unlocked!');
            }
            
            // Check Quest Completer badge (any quest completed)
            if (completedQuests.length >= 1 && !currentBadges.includes('quest_completer')) {
              newBadges.push('quest_completer');
              console.log('✅ Quest Completer badge should be unlocked!');
            }
          } catch (e) {
            console.error('Error parsing quest progress:', e);
          }
        }
        
        // Check First Steps badge (1 challenge)
        if ((user.completedChallenges?.length || 0) >= 1 && !currentBadges.includes('first_steps')) {
          newBadges.push('first_steps');
          console.log('✅ First Steps badge should be unlocked!');
        }
        
        // Check Challenge Master badge (5 challenges)
        if ((user.completedChallenges?.length || 0) >= 5 && !currentBadges.includes('challenge_master')) {
          newBadges.push('challenge_master');
          console.log('✅ Challenge Master badge should be unlocked!');
        }
        
        // IMPORTANT: Use frontend streak system for accurate streak badges
        const frontendStreak = loadUserStreak();
        console.log('Frontend streak data:', frontendStreak);
        
        // Check Daily Coder badge (2 day streak) - using frontend streak
        if (frontendStreak.currentStreak >= 2 && !currentBadges.includes('daily_coder')) {
          newBadges.push('daily_coder');
          console.log('✅ Daily Coder badge should be unlocked!');
        }
        
        // Check Week Warrior badge (7 day streak) - using frontend streak
        if (frontendStreak.currentStreak >= 7 && !currentBadges.includes('week_warrior')) {
          newBadges.push('week_warrior');
          console.log('✅ Week Warrior badge should be unlocked!');
        }
        
        // Check Month Master badge (30 day streak) - using frontend streak
        if (frontendStreak.currentStreak >= 30 && !currentBadges.includes('month_master')) {
          newBadges.push('month_master');
          console.log('✅ Month Master badge should be unlocked!');
        }
        
        if (newBadges.length > 0) {
          console.log(`🎉 Unlocking ${newBadges.length} new badges:`, newBadges);
          
          // Update user badges
          user.badges = [...(user.badges || []), ...newBadges];
          
          // Award XP for each badge (get from achievement definitions)
          let totalXPBonus = 0;
          newBadges.forEach(badge => {
            // Find the achievement definition to get the XP reward
            const achievement = achievements.find(a => a.key === badge);
            const xpReward = achievement?.xpReward || 0;
            totalXPBonus += xpReward;
            console.log(`🎁 Awarded ${xpReward} XP for ${badge} badge`);
          });
          
          user.totalXP += totalXPBonus;
          
          // Update user level based on new total XP
          const levelData = computeLevelProgress(user.totalXP);
          user.currentLevel = levelData.level;
          
          // Update localStorage
          localStorage.setItem("byteclub_user", JSON.stringify(user));
          
          console.log(`🏆 Successfully unlocked ${newBadges.length} badges and awarded ${totalXPBonus} XP!`);
          
          // Show toast notifications for each unlocked badge
          newBadges.forEach(badge => {
            const achievement = achievements.find(a => a.key === badge);
            const badgeName = achievement?.name || badge;
            const xpReward = achievement?.xpReward || 0;
            
            toast.success(`🏆 Badge Unlocked!`, {
              description: `${badgeName}${xpReward > 0 ? ` (+${xpReward} XP)` : ''}`,
              duration: 4000,
            });
          });
          
          // Show summary toast if multiple badges
          if (newBadges.length > 1) {
            toast.success(`🎉 ${newBadges.length} Badges Unlocked!`, {
              description: `You've earned ${totalXPBonus} bonus XP!`,
              duration: 5000,
            });
          }
          
          // Sync badge data to backend
          try {
            console.log('Syncing badge data to backend:', { badges: user.badges, totalXP: user.totalXP });
            const response = await apiService.updateProfile({
              badges: user.badges,
              totalXP: user.totalXP,
              triggerBadgeCheck: false // We already did the badge check
            });
            console.log('✅ Badge data synced to backend successfully:', response);
          } catch (error) {
            console.error('❌ Failed to sync badge data to backend:', error);
            // Don't fail the badge unlock process if backend sync fails
          }
          
          // Dispatch badge update event to notify other components
          console.log('Achievements - Dispatching badgeUpdated event with:', { newBadges, totalXPBonus, userBadges: user.badges });
          window.dispatchEvent(new CustomEvent('badgeUpdated', {
            detail: { 
              newBadges,
              totalXPBonus,
              userData: user
            }
          }));
          
          // Show success message
          alert(`🎉 Unlocked ${newBadges.length} new badges!\n\n${newBadges.join(', ')}\n\n+${totalXPBonus} XP awarded!`);
          
          // Refresh the page to show updated badges
          window.location.reload();
        } else {
          console.log('No new badges to unlock');
        }
      }
    } catch (error) {
      console.error('Error triggering badge check:', error);
      alert('Error checking badges. Please try again.');
    }
  };

  // Fetch achievements from API
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching achievements from API...');
        
        // Auto-check badges when page loads
        console.log('Auto-checking badges on page load...');
        await triggerBadgeCheck();
        
        try {
          const response = await apiService.getMeta('badge');
          console.log('Achievements response:', response);
          
          if (response.success && response.data?.items) {
            const achievementsData = response.data.items;
          
            // Get user's unlocked badges
            const userDataFromStorage = localStorage.getItem("byteclub_user");
            let unlockedBadges: string[] = [];
            
            if (userDataFromStorage) {
              try {
                const parsedData = JSON.parse(userDataFromStorage);
                // Handle both nested and direct user data structures
                const user = parsedData.user || parsedData;
                unlockedBadges = user.badges || [];
                console.log('User unlocked badges:', unlockedBadges);
              } catch (error) {
                console.log('Error parsing user data:', error);
              }
            } else {
              console.log('No user data found in localStorage');
            }
            
            // Function to analyze completed challenges and calculate detailed stats
            const analyzeCompletedChallenges = async (completedChallenges: string[]) => {
            const stats = {
              easyChallengesCompleted: 0,
              mediumChallengesCompleted: 0,
              hardChallengesCompleted: 0,
              veryHardChallengesCompleted: 0,
              arrayChallengesCompleted: 0,
              stringChallengesCompleted: 0,
              graphChallengesCompleted: 0,
              cryptoChallengesCompleted: 0,
              dsaChallengesCompleted: 0,
              fastChallengesCompleted: 0,
              perfectChallengesCompleted: 0
            };

            // Analyze each completed challenge
            // Process challenges in smaller batches to avoid overwhelming the API
            const BATCH_SIZE = 5;
            for (let i = 0; i < completedChallenges.length; i += BATCH_SIZE) {
              const batch = completedChallenges.slice(i, i + BATCH_SIZE);
              
              // Process batch in parallel but with error handling for each
              await Promise.allSettled(
                batch.map(async (slug) => {
                  try {
                    const challenge = await apiService.getChallenge(slug);
                    if (challenge) {
                      // Count by difficulty
                      switch (challenge.difficulty?.toLowerCase()) {
                        case 'easy':
                          stats.easyChallengesCompleted++;
                          break;
                        case 'medium':
                          stats.mediumChallengesCompleted++;
                          break;
                        case 'hard':
                          stats.hardChallengesCompleted++;
                          break;
                        case 'very hard':
                        case 'very-hard':
                        case 'veryhard':
                          stats.veryHardChallengesCompleted++;
                          break;
                      }

                      // Count by topic/tags
                      const tags = challenge.tags || [];
                      const title = challenge.title?.toLowerCase() || '';
                      const description = challenge.description?.toLowerCase() || '';

                      if (tags.includes('array') || title.includes('array') || description.includes('array')) {
                        stats.arrayChallengesCompleted++;
                      }
                      if (tags.includes('string') || title.includes('string') || description.includes('string')) {
                        stats.stringChallengesCompleted++;
                      }
                      if (tags.includes('graph') || title.includes('graph') || description.includes('graph')) {
                        stats.graphChallengesCompleted++;
                      }
                      if (tags.includes('crypto') || title.includes('crypto') || description.includes('crypto')) {
                        stats.cryptoChallengesCompleted++;
                      }
                      if (tags.includes('dsa') || tags.includes('dsa-99') || title.includes('dsa')) {
                        stats.dsaChallengesCompleted++;
                      }

                      // Count fast challenges (completed in under 5 minutes)
                      // This would need to be tracked separately, for now assume some are fast
                      if (Math.random() > 0.7) { // Mock: 30% are considered "fast"
                        stats.fastChallengesCompleted++;
                      }

                      // Count perfect challenges (completed without hints)
                      // This would need to be tracked separately, for now assume some are perfect
                      if (Math.random() > 0.8) { // Mock: 20% are considered "perfect"
                        stats.perfectChallengesCompleted++;
                      }
                    }
                  } catch (error) {
                    console.log(`Could not fetch details for challenge ${slug}:`, error);
                    // For challenges we can't fetch, make educated guesses based on slug
                    if (slug.includes('easy') || slug.includes('simple')) {
                      stats.easyChallengesCompleted++;
                    } else if (slug.includes('medium')) {
                      stats.mediumChallengesCompleted++;
                    } else if (slug.includes('hard')) {
                      stats.hardChallengesCompleted++;
                    }
                    
                    if (slug.includes('array')) {
                      stats.arrayChallengesCompleted++;
                    }
                    if (slug.includes('string')) {
                      stats.stringChallengesCompleted++;
                    }
                    if (slug.includes('graph')) {
                      stats.graphChallengesCompleted++;
                    }
                    if (slug.includes('crypto')) {
                      stats.cryptoChallengesCompleted++;
                    }
                    if (slug.includes('dsa')) {
                      stats.dsaChallengesCompleted++;
                    }
                  }
                })
              );
            }

            return stats;
          };
          
          // Get user stats for progress calculation
          let userStats = {
            challengesCompleted: 0,
            totalXP: 0,
            currentStreak: 0,
            completedAdventureNodes: 0,
            questMissionsCompleted: 0,
            easyChallengesCompleted: 0,
            mediumChallengesCompleted: 0,
            hardChallengesCompleted: 0,
            veryHardChallengesCompleted: 0,
            arrayChallengesCompleted: 0,
            stringChallengesCompleted: 0,
            graphChallengesCompleted: 0,
            cryptoChallengesCompleted: 0,
            dsaChallengesCompleted: 0,
            fastChallengesCompleted: 0,
            perfectChallengesCompleted: 0
          };
          
          if (userDataFromStorage) {
            try {
              const parsedData = JSON.parse(userDataFromStorage);
              // Handle both nested and direct user data structures
              const parsedUser = parsedData.user || parsedData;
              const completedChallenges = parsedUser.completedChallenges || [];
              
              // Analyze completed challenges to get detailed stats
              const challengeStats = await analyzeCompletedChallenges(completedChallenges);
              console.log('🔍 Challenge stats:', { 
                completedChallenges: completedChallenges.length, 
                challengeStats 
              });
              
              // Get adventure nodes progress
              let completedAdventureNodes = 0;
              try {
                const adventureProgress = localStorage.getItem("byte_club_adventure_progress");
                if (adventureProgress) {
                  const nodes = JSON.parse(adventureProgress);
                  completedAdventureNodes = Array.isArray(nodes) ? nodes.length : 0;
                  console.log('🔍 Adventure progress data:', { adventureProgress, nodes, completedAdventureNodes });
                } else {
                  console.log('🔍 No adventure progress found');
                }
              } catch (error) {
                console.log('Error reading adventure progress:', error);
              }
              
              // Get quest missions progress - use user-specific localStorage keys
              let questMissionsCompleted = 0;
              try {
                const userId = parsedUser._id || parsedUser.id || 'anonymous';
                const questProgress = localStorage.getItem(`byte_club_quest_progress_${userId}`);
                if (questProgress) {
                  const data = JSON.parse(questProgress);
                  console.log('🔍 Quest progress data:', data);
                  
                  // Count actual completed missions from the completed array
                  if (data.completed && Array.isArray(data.completed)) {
                    questMissionsCompleted = data.completed.length;
                    console.log('🔍 Quest missions completed (from completed array):', questMissionsCompleted);
                  } else {
                    // Fallback: count from progress percentages if completed array doesn't exist
                    const progress = data.progress || {};
                    const progressValues = Object.values(progress) as number[];
                    questMissionsCompleted = progressValues.reduce((total: number, pct: number) => {
                      // Convert percentage to approximate mission count
                      // Assuming each quest has ~3 missions on average
                      return total + Math.floor((pct / 100) * 3);
                    }, 0);
                    console.log('🔍 Quest missions completed (from progress %):', questMissionsCompleted);
                  }
                } else {
                  console.log('🔍 No quest progress found for user:', userId);
                }
              } catch (error) {
                console.log('Error reading quest progress:', error);
              }
              
              // IMPORTANT: Use frontend streak system for accurate streak data
              const frontendStreakData = loadUserStreak();
              
              // If user has activities but streak is 0, force fix it
              if (frontendStreakData.currentStreak === 0 && (parsedUser.totalXP > 0 || completedChallenges.length > 0 || completedAdventureNodes > 0 || questMissionsCompleted > 0)) {
                console.log('🔧 Achievements - User has activities but streak is 0, fixing...');
                // Force update the streak to 1 for users with activities
                const raw = localStorage.getItem('byteclub_user');
                if (raw) {
                  const user = JSON.parse(raw);
                  user.currentStreak = 1;
                  user.longestStreak = Math.max(user.longestStreak || 0, 1);
                  user.lastActiveDate = new Date().toISOString().slice(0, 10);
                  user.lastActiveTime = new Date().toISOString();
                  localStorage.setItem('byteclub_user', JSON.stringify(user));
                  
                  // Dispatch event to notify components
                  window.dispatchEvent(new CustomEvent('streakMigrated', { 
                    detail: { newStreak: 1 } 
                  }));
                  
                  console.log('✅ Achievements - Fixed broken streak for active user');
                  frontendStreakData.currentStreak = 1; // Update the data we're using
                }
              }
              
              userStats = {
                challengesCompleted: completedChallenges.length,
                totalXP: parsedUser.totalXP || 0,
                currentStreak: frontendStreakData.currentStreak, // Use frontend streak system
                completedAdventureNodes: completedAdventureNodes,
                questMissionsCompleted: questMissionsCompleted,
                ...challengeStats
              };
              
              console.log('🔍 Achievements - User stats updated:', {
                currentStreak: userStats.currentStreak,
                frontendStreakData: frontendStreakData,
                totalXP: userStats.totalXP,
                completedChallenges: completedChallenges.length,
                completedAdventureNodes: completedAdventureNodes,
                questMissionsCompleted: questMissionsCompleted,
                hasActivities: parsedUser.totalXP > 0 || completedChallenges.length > 0 || completedAdventureNodes > 0 || questMissionsCompleted > 0
              });
              console.log('User stats for achievements:', userStats);
            } catch (error) {
              console.log('Error parsing user data for stats:', error);
            }
          }
          
          // Mark achievements as unlocked and calculate real progress
          const achievementsWithStatus = achievementsData.map(achievement => {
            const unlocked = unlockedBadges.includes(achievement.key);
            
            // Calculate progress based on achievement requirements
            let progress = undefined;
            if (!unlocked) {
              // Calculate progress based on badge key and user stats
              switch (achievement.key) {
                // Basic Progression Badges
                case 'first_steps':
                  progress = {
                    current: Math.min(userStats.challengesCompleted, 1),
                    total: 1
                  };
                  break;
                case 'challenge_master':
                  progress = {
                    current: Math.min(userStats.challengesCompleted, 5),
                    total: 5
                  };
                  break;
                case 'coding_warrior':
                  progress = {
                    current: Math.min(userStats.challengesCompleted, 15),
                    total: 15
                  };
                  break;
                case 'algorithm_legend':
                  progress = {
                    current: Math.min(userStats.challengesCompleted, 30),
                    total: 30
                  };
                  break;
                
                // Streak Badges
                case 'daily_coder':
                  progress = {
                    current: Math.min(userStats.currentStreak, 2),
                    total: 2
                  };
                  console.log('🔍 Daily Coder progress:', { 
                    current: progress.current, 
                    total: progress.total, 
                    userStatsCurrentStreak: userStats.currentStreak 
                  });
                  break;
                case 'week_warrior':
                  progress = {
                    current: Math.min(userStats.currentStreak, 7),
                    total: 7
                  };
                  console.log('🔍 Week Warrior progress:', { 
                    current: progress.current, 
                    total: progress.total, 
                    userStatsCurrentStreak: userStats.currentStreak 
                  });
                  break;
                case 'month_master':
                  progress = {
                    current: Math.min(userStats.currentStreak, 30),
                    total: 30
                  };
                  console.log('🔍 Month Master progress:', { 
                    current: progress.current, 
                    total: progress.total, 
                    userStatsCurrentStreak: userStats.currentStreak 
                  });
                  break;
                case 'streak_legend':
                  progress = {
                    current: Math.min(userStats.currentStreak, 100),
                    total: 100
                  };
                  console.log('🔍 Streak Legend progress:', { 
                    current: progress.current, 
                    total: progress.total, 
                    userStatsCurrentStreak: userStats.currentStreak 
                  });
                  break;
                
                // Difficulty Mastery Badges
                case 'easy_ace':
                  progress = {
                    current: Math.min(userStats.easyChallengesCompleted, 5),
                    total: 5
                  };
                  break;
                case 'medium_maestro':
                  progress = {
                    current: Math.min(userStats.mediumChallengesCompleted, 10),
                    total: 10
                  };
                  break;
                case 'hard_hero':
                  progress = {
                    current: Math.min(userStats.hardChallengesCompleted, 5),
                    total: 5
                  };
                  break;
                case 'very_hard_virtuoso':
                  progress = {
                    current: Math.min(userStats.veryHardChallengesCompleted, 3),
                    total: 3
                  };
                  break;
                
                // Topic Mastery Badges
                case 'array_architect':
                  progress = {
                    current: Math.min(userStats.arrayChallengesCompleted, 5),
                    total: 5
                  };
                  break;
                case 'string_sorcerer':
                  progress = {
                    current: Math.min(userStats.stringChallengesCompleted, 5),
                    total: 5
                  };
                  break;
                case 'graph_guru':
                  progress = {
                    current: Math.min(userStats.graphChallengesCompleted, 3),
                    total: 3
                  };
                  break;
                case 'crypto_crusader':
                  progress = {
                    current: Math.min(userStats.cryptoChallengesCompleted, 3),
                    total: 3
                  };
                  break;
                case 'dsa_destroyer':
                  progress = {
                    current: Math.min(userStats.dsaChallengesCompleted, 10),
                    total: 10
                  };
                  break;
                
                // Quest Completion Badges
                case 'quantum_vault_breaker':
                  // Check if Quantum Vault quest is completed (100% progress)
                  const quantumVaultProgress = (() => {
                    try {
                      const userData = localStorage.getItem("byteclub_user");
                      if (userData) {
                        const user = JSON.parse(userData);
                        const userId = user._id || user.id || "anonymous";
                        const userSpecificKey = `byte_club_quest_progress_${userId}`;
                        const questProgress = localStorage.getItem(userSpecificKey);
                        if (questProgress) {
                          const data = JSON.parse(questProgress);
                          const completed = data.completed || [];
                          return completed.includes('quest-1') ? 1 : 0;
                        }
                      }
                    } catch (error) {
                      console.log('Error reading quest progress for quantum vault:', error);
                    }
                    return 0;
                  })();
                  progress = {
                    current: quantumVaultProgress,
                    total: 1
                  };
                  break;
                case 'quest_completer':
                  // Check if any quest is completed (100% progress)
                  const anyQuestCompleted = (() => {
                    try {
                      const userData = localStorage.getItem("byteclub_user");
                      if (userData) {
                        const user = JSON.parse(userData);
                        const userId = user._id || user.id || "anonymous";
                        const userSpecificKey = `byte_club_quest_progress_${userId}`;
                        const questProgress = localStorage.getItem(userSpecificKey);
                        if (questProgress) {
                          const data = JSON.parse(questProgress);
                          const completed = data.completed || [];
                          return completed.length >= 1 ? 1 : 0;
                        }
                      }
                    } catch (error) {
                      console.log('Error reading quest progress:', error);
                    }
                    return 0;
                  })();
                  progress = {
                    current: anyQuestCompleted,
                    total: 1
                  };
                  break;
                
                // Adventure Map Badges
                case 'adventure_explorer':
                  progress = {
                    current: Math.min(userStats.completedAdventureNodes, 5),
                    total: 5
                  };
                  break;
                case 'adventure_master':
                progress = {
                    current: Math.min(userStats.completedAdventureNodes, 20),
                    total: 20
                };
                  break;
                case 'adventure_legend':
                progress = {
                    current: Math.min(userStats.completedAdventureNodes, 50),
                    total: 50
                  };
                  break;
                
                // Speed and Efficiency Badges
                case 'speed_demon':
                progress = {
                    current: Math.min(userStats.fastChallengesCompleted, 5),
                    total: 5
                };
                  break;
                case 'perfectionist':
                progress = {
                    current: Math.min(userStats.perfectChallengesCompleted, 10),
                    total: 10
                  };
                  break;
                
                // XP Milestone Badges
                case 'xp_novice':
                progress = {
                    current: Math.min(userStats.totalXP, 12000),
                    total: 12000
                };
                  break;
                case 'xp_warrior':
                progress = {
                    current: Math.min(userStats.totalXP, 25000),
                    total: 25000
                };
                  break;
                case 'xp_legend':
                progress = {
                    current: Math.min(userStats.totalXP, 50000),
                    total: 50000
                };
                  break;
                case 'xp_god':
                progress = {
                    current: Math.min(userStats.totalXP, 100000),
                    total: 100000
                };
                  break;
                
                default:
                  // For any other badges, show 0 progress
                progress = {
                    current: 0,
                    total: 1
                };
                  break;
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
            // Basic Progression
            'first_steps',      // 50 XP - First achievement
            'challenge_master', // 150 XP - 5 challenges
            'coding_warrior',   // 300 XP - 15 challenges
            'algorithm_legend', // 500 XP - 30 challenges
            
            // Streak Badges
            'daily_coder',      // 100 XP - 1 day streak
            'week_warrior',     // 200 XP - 7 day streak
            'month_master',     // 500 XP - 30 day streak
            'streak_legend',    // 1000 XP - 100 day streak
            
            // Difficulty Mastery
            'easy_ace',         // 150 XP - 5 easy challenges
            'medium_maestro',   // 300 XP - 10 medium challenges
            'hard_hero',        // 400 XP - 5 hard challenges
            'very_hard_virtuoso', // 600 XP - 3 very hard challenges
            
            // Topic Mastery
            'array_architect',  // 250 XP - 5 array challenges
            'string_sorcerer',  // 250 XP - 5 string challenges
            'graph_guru',       // 400 XP - 3 graph challenges
            'crypto_crusader',  // 500 XP - 3 crypto challenges
            'dsa_destroyer',    // 600 XP - 10 DSA challenges
            
            // Quest & Adventure
            'quantum_vault_breaker', // 800 XP - Quantum Vault quest
            'quest_completer',  // 600 XP - Any quest
            'adventure_explorer', // 200 XP - 5 adventure nodes
            'adventure_master', // 400 XP - 20 adventure nodes
            'adventure_legend', // 800 XP - 50 adventure nodes
            
            // Speed & Efficiency
            'speed_demon',      // 400 XP - 5 fast challenges
            'perfectionist',    // 600 XP - 10 perfect challenges
            
            // XP Milestones
            'xp_novice',        // 200 XP - 12,000 total XP
            'xp_warrior',       // 500 XP - 25,000 total XP
            'xp_legend',        // 1000 XP - 50,000 total XP
            'xp_god'            // 2500 XP - 100,000 total XP
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
          } catch (apiError) {
            console.error('Error fetching achievements from API:', apiError);
            setError('Failed to load achievements from server. Please try again later.');
            setAchievements([]); // Set empty array to prevent crashes
          }
      } catch (error) {
        console.error('Error in fetchAchievements:', error);
        setError('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Listen for streak updates and badge updates
  useEffect(() => {
    const handleStreakMigrated = () => {
      console.log('Streak migrated, refreshing achievements...');
      // Refresh the page to update streak progress
      window.location.reload();
    };

    const handleBadgeUpdated = () => {
      console.log('Badge updated, refreshing achievements...');
      // Refresh the page to show new badges
      window.location.reload();
    };

    const handleChallengeCompleted = () => {
      console.log('Challenge completed, refreshing achievements...');
      // Refresh the page to update progress
      window.location.reload();
    };

    window.addEventListener('streakMigrated', handleStreakMigrated);
    window.addEventListener('badgeUpdated', handleBadgeUpdated);
    window.addEventListener('challengeCompleted', handleChallengeCompleted);

    return () => {
      window.removeEventListener('streakMigrated', handleStreakMigrated);
      window.removeEventListener('badgeUpdated', handleBadgeUpdated);
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
    };
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/home")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Achievements
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerBadgeCheck}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Award className="h-4 w-4 mr-2" />
              Check Badges
            </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                console.log('Refreshing user data...');
                const userData = await apiService.getCurrentUser();
                localStorage.setItem("byteclub_user", JSON.stringify(userData));
                console.log('User data refreshed:', userData);
                // Refresh achievements
                window.location.reload();
              } catch (error) {
                console.error('Failed to refresh user data:', error);
              }
            }}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          </div>
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