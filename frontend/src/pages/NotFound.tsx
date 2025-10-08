import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <FloatingParticles count={30} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-md mx-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <AlertTriangle className="w-24 h-24 text-primary mx-auto" />
        </motion.div>

        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">Bug Not Found!</h2>
        <p className="text-xl text-muted-foreground mb-8">
          This path doesn't exist in the digital realm. Perhaps it was never compiled?
        </p>

        <div className="space-y-4">
          <Button variant="cyber" size="lg" onClick={() => navigate("/home")} className="w-full">
            Return to Home Base
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate(-1)} className="w-full">
            Go Back
          </Button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-muted-foreground italic"
        >
          "Even the best hackers hit dead ends"
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
