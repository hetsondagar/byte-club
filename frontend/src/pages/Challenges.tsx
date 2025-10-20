import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Zap, Loader2, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";

interface Challenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true/false" | "code";
  xpReward: number;
  tags: string[];
  completed?: boolean;
}

export default function Challenges() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard" | "completed">("all");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Function to fetch and update challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching challenges from API...');
      
      // Fetch only our DSA-99 code challenges; fallback to all code if none tagged yet
      let challengesData = await apiService.getChallengesFiltered({ type: 'code', tags: ['dsa-99'] });
      if (!Array.isArray(challengesData) || challengesData.length === 0) {
        console.log('No dsa-99 tagged items returned, falling back to type=code');
        challengesData = await apiService.getChallengesFiltered({ type: 'code' });
      }
      console.log('Challenges data:', challengesData);
      
      // Get user's completed challenges to mark them
      const userData = localStorage.getItem("byteclub_user");
      let completedChallenges: string[] = [];
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          // Handle both nested and direct user data structures
          const user = parsedData.user || parsedData;
          completedChallenges = user.completedChallenges || [];
          console.log('User completed challenges:', completedChallenges);
          console.log('Full user data from localStorage:', parsedData);
          console.log('Extracted user object:', user);
          console.log('completedChallenges type:', typeof user.completedChallenges);
          console.log('completedChallenges is array:', Array.isArray(user.completedChallenges));
        } catch (error) {
          console.log('Error parsing user data:', error);
        }
      } else {
        console.log('No user data found in localStorage');
      }
      
      // Mark challenges as completed if user has completed them
      const challengesWithStatus = challengesData.map(challenge => {
        const isCompleted = completedChallenges.includes(challenge.slug);
        console.log(`Challenge ${challenge.slug} (${challenge.title}): completed = ${isCompleted}`);
        return {
          ...challenge,
          completed: isCompleted
        };
      });
      
      setChallenges(challengesWithStatus);
      console.log('Challenges loaded successfully:', challengesWithStatus.length);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch challenges from API
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Listen for challenge completion events
  useEffect(() => {
    const handleChallengeCompleted = (event: any) => {
      console.log('Challenge completed event received:', event.detail);
      console.log('Refreshing challenges list...');
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        fetchChallenges();
      }, 100);
    };

    // Also refresh when window regains focus (user comes back from challenge page)
    const handleWindowFocus = () => {
      console.log('Window focused, refreshing challenges...');
      fetchChallenges();
    };

    window.addEventListener('challengeCompleted', handleChallengeCompleted);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "all") return true;
    if (filter === "completed") return c.completed;
    return c.difficulty === filter;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "cyan";
      case "medium": return "violet";
      case "hard": return "blue";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-lg">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
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
    <div className="min-h-screen bg-black text-white">
      <FloatingParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Challenges
              </h1>
              <p className="text-gray-400 mt-2">
                Welcome back, {username}! Choose your next challenge.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchChallenges}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
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
                  // Refresh challenges
                  fetchChallenges();
                } catch (error) {
                  console.error('Failed to refresh user data:', error);
                }
              }}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh User
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="max-w-6xl mx-auto" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Direct render panel (avoid TabsContent hiding due to dynamic values) */}
          <div className="space-y-4">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {filter === "completed" 
                    ? "No completed challenges yet. Start solving to see your progress!" 
                    : "No challenges found for this filter."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NeonCard
                      variant={getDifficultyBadge(challenge.difficulty) as any}
                      glow
                      className="h-full cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate(`/challenges/${challenge.slug}`)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold">{challenge.title}</h3>
                          {challenge.completed && <span className="text-2xl">✓</span>}
                        </div>
                        <p className="text-gray-300 text-sm">{challenge.description}</p>
                        <div className="flex items-center justify-between">
                          <NeonBadge variant={getDifficultyBadge(challenge.difficulty) as any}>
                            {challenge.difficulty}
                          </NeonBadge>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.xpReward} XP
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {challenge.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-white/10 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {challenge.tags.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                              +{challenge.tags.length - 3}
                            </span>
                          )}
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                          onClick={(e) => { e.stopPropagation(); navigate(`/challenges/${challenge.slug}`); }}
                        >
                          {challenge.completed ? "Retry" : "Start Challenge"}
                        </Button>
                      </div>
                    </NeonCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}