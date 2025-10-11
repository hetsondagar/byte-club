import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonCard } from "@/components/ui/neon-card";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Lock, User, Terminal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Access Denied", {
        description: "All fields must be compiled",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login(email, password);
      
      toast.success("Access Granted", {
        description: `Welcome back, ${response.user.username}!`,
      });
      
      navigate("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Authentication Failed", {
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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
            <Terminal className="w-16 h-16 text-primary animate-pulse-glow" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            byte_club
          </h1>
          <p className="text-muted-foreground">&lt;/where every byte counts&gt;</p>
        </div>

        <NeonCard variant="cyan" glow className="backdrop-blur-sm bg-card/80">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                <User className="inline w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-input border-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access code"
                className="bg-input border-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <Button type="submit" variant="cyber" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Terminal className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Authenticating..." : "Initialize Login Sequence"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">No account? </span>
              <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors">
                Register Now
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
          "Compile your destiny"
        </motion.p>
      </motion.div>
    </div>
  );
}
