import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, User, Trophy, Settings, LogOut, Menu, X, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { NeonBadge } from "./ui/neon-badge";
import { useState, useEffect } from "react";
import { computeLevelProgress } from "@/lib/xp";
import { apiService } from "@/services/api";

interface NavbarProps {
  username?: string;
  level?: number;
  xp?: number;
  onLogout?: () => void;
}

export function Navbar({ username = "Hacker", level = 12, xp = 2450, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ username: "Hacker", level: 1, xp: 0 });

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = async () => {
      // Always try to fetch fresh data from API first
      try {
        const userData = await apiService.getCurrentUser();
        if (userData) {
          const totalXP = userData.totalXP || 0;
          const { level, currentXP } = computeLevelProgress(totalXP);
          console.log('Navbar - Fresh API data - totalXP:', totalXP, 'level:', level, 'currentXP:', currentXP);
          console.log('Navbar - Backend returned level:', userData.currentLevel);
          setUserData({
            username: userData.username || "Hacker",
            level: level,
            xp: currentXP
          });
          
          // Update localStorage with fresh data
          localStorage.setItem('byteclub_user', JSON.stringify(userData));
          return;
        }
      } catch (error) {
        console.log('Error fetching fresh user data:', error);
      }

      // Fallback to localStorage if API fails
      const user = localStorage.getItem("byteclub_user");
      if (user) {
        try {
          const parsedData = JSON.parse(user);
          // Handle both nested and direct user data structures
          const parsed = parsedData.user || parsedData;
          const totalXP = parsed.totalXP || 0;
          const { level, currentXP } = computeLevelProgress(totalXP);
          console.log('Navbar - localStorage data - totalXP:', totalXP, 'level:', level, 'currentXP:', currentXP);
          setUserData({
            username: parsed.username || "Hacker",
            level: level,
            xp: currentXP
          });
        } catch (error) {
          console.log('Error parsing user data:', error);
        }
      }
    };

    getUserData();

    // Listen for user data updates
    const handleStorageChange = () => getUserData();
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for our custom challenge completion event
    const handleChallengeCompleted = () => {
      console.log('Navbar - Challenge completed event received, refreshing data...');
      getUserData();
    };
    window.addEventListener('challengeCompleted', handleChallengeCompleted);
    
    // Listen for adventure progress updates
    const handleAdventureProgressUpdate = () => {
      console.log('Navbar - Adventure progress update event received, refreshing data...');
      getUserData();
    };
    window.addEventListener('adventureProgressUpdate', handleAdventureProgressUpdate);
    
    // Listen for badge updates
    const handleBadgeUpdate = () => {
      console.log('Navbar - Badge update event received, refreshing data...');
      getUserData();
    };
    window.addEventListener('badgeUpdated', handleBadgeUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
      window.removeEventListener('adventureProgressUpdate', handleAdventureProgressUpdate);
      window.removeEventListener('badgeUpdated', handleBadgeUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("byteclub_user");
      navigate("/");
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      if (userData) {
        const totalXP = userData.totalXP || 0;
        const { level, currentXP } = computeLevelProgress(totalXP);
        setUserData({
          username: userData.username || "Hacker",
          level: level,
          xp: currentXP
        });
        
        // Update localStorage with fresh data
        localStorage.setItem('byteclub_user', JSON.stringify(userData));
        console.log('Navbar - Manual refresh - totalXP:', totalXP, 'level:', level, 'currentXP:', currentXP);
      }
    } catch (error) {
      console.log('Error refreshing user data:', error);
    }
  };

  const navLinks = [
    { name: "Adventure Map", path: "/adventure-map", icon: "🗺️" },
    { name: "Quests", path: "/quests", icon: "⚡" },
    { name: "Code Heist", path: "/code-heist", icon: "🎮" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-primary/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex-shrink-0"
            >
              {/* Brand Logo - served from public, no background */}
              <img src="/logo_byteclub.png" alt="byte_club" className="w-10 h-10 md:w-12 md:h-12 relative z-10" />
            </motion.div>
            
            <div className="flex flex-col justify-center">
              <motion.h1
                className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight"
                whileHover={{ scale: 1.05 }}
              >
                byte_club
              </motion.h1>
              <span className="text-[9px] md:text-[10px] text-muted-foreground tracking-wider font-mono mt-0.5">
                &lt;/where every byte counts&gt;
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={link.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {link.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* XP Badge - Hidden on small screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <NeonBadge variant="default" className="px-3 py-1 cursor-pointer" onClick={refreshUserData}>
                <Zap className="w-3 h-3 mr-1" />
                <span className="font-bold">Lv {userData.level}</span>
                <span className="mx-2">•</span>
                <span className="text-primary">{userData.xp} XP</span>
              </NeonBadge>
            </motion.div>

            {/* Profile Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block"
            >
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="max-w-[100px] truncate">{userData.username}</span>
                </Button>
              </Link>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden md:block"
            >
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="hidden md:block"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/20 py-4 space-y-2"
          >
            {/* User Info Mobile */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">{userData.username}</p>
                  <p className="text-xs text-muted-foreground">Level {userData.level} • {userData.xp} XP</p>
                </div>
              </div>
            </div>

            {/* Nav Links Mobile */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-semibold">{link.name}</span>
              </Link>
            ))}

            {/* Actions Mobile */}
            <div className="flex gap-2 pt-2">
              <Link to="/profile" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>

            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        )}
      </div>

      {/* Neon Glow Bottom Border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.nav>
  );
}

