import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/neon-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { ArrowLeft, ShoppingBag, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
  type: "theme" | "badge" | "effect";
  icon: string;
  purchased: boolean;
}

const rewards: Reward[] = [
  { id: 1, name: "Neon Purple Theme", description: "Change adventure map colors to purple", cost: 500, type: "theme", icon: "🎨", purchased: false },
  { id: 2, name: "Gold Badge Frame", description: "Golden border for your badges", cost: 800, type: "badge", icon: "🏆", purchased: false },
  { id: 3, name: "Confetti Explosion", description: "Enhanced confetti effects", cost: 300, type: "effect", icon: "🎉", purchased: true },
  { id: 4, name: "Cyber Green Theme", description: "Matrix-style green theme", cost: 600, type: "theme", icon: "💚", purchased: false },
  { id: 5, name: "Glitch Effect", description: "Glitch animations on hover", cost: 700, type: "effect", icon: "⚡", purchased: false },
  { id: 6, name: "Elite Badge Pack", description: "Unlock 3 exclusive badges", cost: 1000, type: "badge", icon: "⭐", purchased: false },
];

export default function Rewards() {
  const navigate = useNavigate();
  const [userXP] = useState(2450);

  const handlePurchase = (reward: Reward) => {
    if (reward.purchased) {
      toast.info("Already Owned", {
        description: "You already own this item",
      });
      return;
    }

    if (userXP < reward.cost) {
      toast.error("Insufficient XP", {
        description: `You need ${reward.cost - userXP} more XP`,
      });
      return;
    }

    toast.success("Purchase Complete!", {
      description: `${reward.name} has been added to your account`,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={20} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Rewards Shop
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NeonCard variant="cyan" glow>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShoppingBag className="w-10 h-10 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Your Balance</h2>
                    <p className="text-muted-foreground">Spend XP on exclusive items</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                    <Zap className="w-8 h-8" />
                    {userXP.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Available XP</div>
                </div>
              </div>
            </NeonCard>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NeonCard
                  variant={reward.type === "theme" ? "cyan" : reward.type === "badge" ? "violet" : "blue"}
                  glow
                  className={reward.purchased ? "opacity-75" : ""}
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <motion.div
                        className="text-5xl mb-3"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {reward.icon}
                      </motion.div>
                      <h3 className="text-lg font-bold mb-1">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <NeonBadge variant="default">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {reward.type}
                      </NeonBadge>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Zap className="w-4 h-4" />
                        {reward.cost}
                      </div>
                    </div>

                    <Button
                      variant={reward.purchased ? "outline" : "neon"}
                      className="w-full"
                      onClick={() => handlePurchase(reward)}
                      disabled={reward.purchased}
                    >
                      {reward.purchased ? "Owned" : userXP >= reward.cost ? "Purchase" : "Not Enough XP"}
                    </Button>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground"
          >
            <p>"Customize your experience, hack your style"</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
