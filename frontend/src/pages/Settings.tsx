import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Save, User as UserIcon, Mail, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { loadUserStreak } from "@/lib/streak";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0
  });
  const [settings, setSettings] = useState({
    username: "",
    email: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = localStorage.getItem("byteclub_user");
        if (!user) {
          navigate("/login");
          return;
        }
        
        const parsedData = JSON.parse(user);
        const userInfo = parsedData.user || parsedData;
        
        // Get streak from frontend streak system
        const streakData = loadUserStreak();
        
        setUserData({
          username: userInfo.username || "Hacker",
          email: userInfo.email || "",
          totalXP: userInfo.totalXP || 0,
          currentLevel: userInfo.currentLevel || 1,
          currentStreak: streakData.currentStreak // Use frontend streak system
        });
        
        setSettings({
          username: userInfo.username || "",
          email: userInfo.email || ""
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        navigate("/login");
      }
    };

    loadUserData();

    // Listen for streak migration events to refresh the display
    const handleStreakMigration = () => {
      const streakData = loadUserStreak();
      setUserData(prev => ({
        ...prev,
        currentStreak: streakData.currentStreak
      }));
    };

    window.addEventListener('streakMigrated', handleStreakMigration);
    
    return () => {
      window.removeEventListener('streakMigrated', handleStreakMigration);
    };
  }, [navigate]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("Password Too Short", {
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setSaving(true);

    try {
      // Update profile via API
      const updateData: any = {
        username: settings.username,
        email: settings.email
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      const response = await apiService.updateProfile(updateData);
      
      // Update localStorage with new data and refresh streak
      const currentUser = localStorage.getItem("byteclub_user");
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        const streakData = loadUserStreak(); // Get fresh streak data
        
        const updatedUser = {
          ...parsedUser,
          user: {
            ...parsedUser.user,
            username: settings.username,
            email: settings.email,
            currentStreak: streakData.currentStreak // Update streak in user data
          }
        };
        localStorage.setItem("byteclub_user", JSON.stringify(updatedUser));
        
        // Update local state with fresh streak data
        setUserData(prev => ({
          ...prev,
          username: settings.username,
          email: settings.email,
          currentStreak: streakData.currentStreak
        }));
      }

      toast.success("Settings Saved", {
        description: "Your profile has been updated successfully",
      });

      // Clear password fields
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Update Failed", {
        description: error.message || "Could not save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingParticles count={20} />
      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* User Stats Card */}
        <div className="max-w-2xl mx-auto mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="blue" glow>
              <h3 className="text-xl font-semibold mb-4">Account Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="text-3xl font-bold text-primary">{userData.currentLevel}</div>
                  <div className="text-xs text-muted-foreground mt-1">Level</div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                  <div className="text-3xl font-bold text-secondary">{userData.totalXP.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total XP</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/30">
                  <div className="text-3xl font-bold text-accent">{userData.currentStreak}</div>
                  <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
                </div>
              </div>
            </NeonCard>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={settings.username}
                    onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                    className="bg-input border-primary/30"
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-input border-primary/30"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeonCard variant="violet" glow>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Change Password
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="bg-input border-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="bg-input border-secondary/30"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  💡 Leave blank to keep current password
                </p>
              </div>
            </NeonCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button 
              variant="cyber" 
              size="lg" 
              className="flex-1" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/home")} disabled={saving}>
              Cancel
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
