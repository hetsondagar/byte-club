import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonCard } from "@/components/ui/neon-card";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Lock, User, Mail, Terminal } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Compilation Error", {
        description: "All fields are required",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Security Alert", {
        description: "Password must be at least 6 characters",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Validation Failed", {
        description: "Passwords do not match",
      });
      return;
    }

    // Mock signup
    localStorage.setItem("byteclub_user", formData.username);
    toast.success("Registration Complete", {
      description: "Welcome to Byte Club!",
    });
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <FloatingParticles count={30} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4"
          >
            <Terminal className="w-16 h-16 text-secondary animate-pulse-glow" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            JOIN THE CLUB
          </h1>
          <p className="text-muted-foreground">Create your hacker profile</p>
        </div>

        <NeonCard variant="violet" glow className="backdrop-blur-sm bg-card/80">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                <User className="inline w-4 h-4 mr-2" />
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose your handle"
                className="bg-input border-secondary/30 focus:border-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-input border-secondary/30 focus:border-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="bg-input border-secondary/30 focus:border-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="inline w-4 h-4 mr-2" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="bg-input border-secondary/30 focus:border-secondary"
              />
            </div>

            <Button type="submit" variant="cyber" className="w-full" size="lg">
              <Terminal className="mr-2 h-4 w-4" />
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/" className="text-secondary hover:text-secondary/80 transition-colors">
                Login Here
              </Link>
            </div>
          </form>
        </NeonCard>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          "Where bugs fear to crawl"
        </motion.p>
      </motion.div>
    </div>
  );
}
