import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
}

const colors = [
  "hsl(180 100% 50%)", // cyan
  "hsl(270 100% 62%)", // violet
  "hsl(220 100% 51%)", // blue
  "hsl(140 100% 50%)", // green
];

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              left: piece.x,
            }}
            initial={{ y: piece.y, opacity: 1, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              opacity: 0,
              rotate: piece.rotation + 720,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              ease: "easeIn",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
