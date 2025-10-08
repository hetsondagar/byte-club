import { useEffect, useRef } from "react";

interface MatrixRainProps {
  color?: string;
  fontSize?: number;
  speed?: number;
}

export function MatrixRain({ 
  color = "hsl(180 100% 50%)", // Neon cyan by default
  fontSize = 14,
  speed = 50 
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix configuration
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0);
    const binary = ["0", "1"];

    // Drawing function
    const draw = () => {
      // Fade effect - creates the trail
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"; // Match background color with low opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      // Draw binary characters
      for (let i = 0; i < drops.length; i++) {
        // Random binary character
        const text = binary[Math.floor(Math.random() * binary.length)];
        
        // Draw the character
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        // Reset drop to top randomly or when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    // Animation loop
    const interval = setInterval(draw, speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [color, fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.15 }} // Subtle effect
    />
  );
}

