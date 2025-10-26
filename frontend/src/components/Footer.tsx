import { motion } from "framer-motion";
import { Github, Linkedin, Heart, Code, Zap } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mt-auto bg-gradient-to-r from-background via-card to-background border-t border-primary/20"
    >
      <div className="container mx-auto px-4 py-4">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center space-y-3">
          
          {/* Developer Credits */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Code className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-muted-foreground text-xs font-mono">crafted with</span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse" />
              <span className="text-muted-foreground text-xs font-mono">by</span>
              <Zap className="w-4 h-4 text-secondary animate-pulse" />
            </div>
            
            {/* Developer Names */}
            <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
              >
                <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent group-hover:animate-pulse">
                  Het Sondagar
                </h3>
              </motion.div>
              
              <span className="hidden md:block text-primary/50 text-xl">×</span>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
              >
                <h3 className="text-sm md:text-base font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent group-hover:animate-pulse">
                  Sanvi Shanishchara
                </h3>
              </motion.div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            {/* Het's Links */}
            <div className="flex items-center gap-2">
              <motion.a
                href="https://github.com/hetsondagar"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-card/50 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Github className="w-3.5 h-3.5 text-primary" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/het-sondagar-433095284/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-card/50 border border-secondary/20 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/20"
              >
                <Linkedin className="w-3.5 h-3.5 text-secondary" />
              </motion.a>
            </div>

            {/* Sanvi's Links */}
            <div className="flex items-center gap-2">
              <motion.a
                href="https://github.com/sanvi-s"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-card/50 border border-accent/20 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
              >
                <Github className="w-3.5 h-3.5 text-accent" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/sanvi-shanishchara-368297287/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-card/50 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Linkedin className="w-3.5 h-3.5 text-primary" />
              </motion.a>
            </div>
          </motion.div>

          {/* Witty Tagline - Compact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground font-mono italic">
              "Two developers, infinite bugs, zero sleep 🚀"
            </p>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center border-t border-primary/10 pt-2 w-full"
          >
            <p className="text-xs text-muted-foreground/70 font-mono">
              © 2025 byte_club • Built with ☕, 💻, and way too much caffeine
            </p>
          </motion.div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-8 right-8 w-1 h-1 bg-secondary rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-4 left-1/2 w-1 h-1 bg-accent rounded-full"
        />
      </div>
    </motion.footer>
  );
}
