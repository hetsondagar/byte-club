import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { AuthProvider } from "@/contexts/AuthContext";
import { CodeHeistProvider } from "@/contexts/CodeHeistContext";
import { StreakNotificationWrapper } from "@/components/StreakNotificationWrapper";
import { Footer } from "@/components/Footer";
import { config } from "@/config/env";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import AdventureMap from "./pages/AdventureMap";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Leaderboard from "./pages/Leaderboard";
import LeaderboardDetail from "./pages/LeaderboardDetail";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Tutorial from "./pages/Tutorial";
import Settings from "./pages/Settings";
import Quests from "./pages/Quests";
import QuestDetailPage from "./pages/QuestDetailPage";
import Notifications from "./pages/Notifications";
import Archive from "./pages/Archive";
import Rewards from "./pages/Rewards";
import Test from "./pages/Test";
import CodeHeist from "./pages/CodeHeist";
import CodeHeistLobby from "./pages/CodeHeistLobby";
import CodeHeistGame from "./pages/CodeHeistGame";
import ByteRush from "./pages/ByteRush";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Configuration logging disabled

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CodeHeistProvider>
          <TooltipProvider>
            <StreakNotificationWrapper>
              <Toaster />
              <Sonner />
              {/* Matrix Rain Background - Falls behind all content */}
              <MatrixRain color="hsl(140 100% 50%)" fontSize={16} speed={50} />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/adventure-map" element={<AdventureMap />} />
                      <Route path="/challenges" element={<Challenges />} />
                      <Route path="/challenges/:slug" element={<ChallengeDetail />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/leaderboard/:username" element={<LeaderboardDetail />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/tutorial" element={<Tutorial />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/quests" element={<Quests />} />
                      <Route path="/quests/:id" element={<QuestDetailPage />} />
                      <Route path="/quest/:id" element={<ChallengeDetail />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/archive" element={<Archive />} />
                      <Route path="/rewards" element={<Rewards />} />
                      <Route path="/test" element={<Test />} />
                      {/* Code Heist Game Routes */}
                      <Route path="/code-heist" element={<CodeHeist />} />
                      <Route path="/code-heist/lobby" element={<CodeHeistLobby />} />
                      <Route path="/code-heist/join" element={<CodeHeistLobby />} />
                      <Route path="/code-heist/game" element={<CodeHeistGame />} />
                      {/* Byte Rush Game Route */}
                      <Route path="/byte-rush" element={<ByteRush />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              </BrowserRouter>
            </StreakNotificationWrapper>
          </TooltipProvider>
        </CodeHeistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
