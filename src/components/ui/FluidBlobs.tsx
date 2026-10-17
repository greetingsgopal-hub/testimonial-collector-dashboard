"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FluidBlobsProps {
  lightColors?: string[];
  darkColors?: string[];
  origins?: { x: number; y: number }[];
  margin?: number;
  blur?: number;
  className?: string;
}

const DEFAULT_ORIGINS = [
  { x: 50, y: -55 },
  { x: 30, y: -25 },
  { x: 70, y: -25 },
  { x: 50, y: 10 },
];

export function FluidBlobs({
  lightColors = ["#ff0020", "#fc0f60", "#e8227a", "#ff85b3"],
  darkColors = ["#8c0f60", "#e8227a", "#e8227a", "#ff85b3"],
  origins = DEFAULT_ORIGINS,
  margin = 60,
  blur = 50,
  className,
}: FluidBlobsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkDark = () => {
      const el = containerRef.current;
      const isDarkMode =
        Boolean(el?.closest(".dark")) ||
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const activeColors = isDark && darkColors.length > 0 ? darkColors : lightColors;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        filter: `blur(${blur}px)`,
      }}
    >
      {origins.map((origin, index) => {
        const color = activeColors[index % activeColors.length];
        const animationDelay = index * 0.8;
        const duration = 6 + index * 1.5;

        return (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${origin.x}%`,
              top: `${origin.y}%`,
              width: `${margin * 4}px`,
              height: `${margin * 4}px`,
              marginLeft: `-${margin * 2}px`,
              marginTop: `-${margin * 2}px`,
              background: `radial-gradient(circle, ${color} 0%, ${color}88 40%, transparent 70%)`,
              opacity: 0.85,
            }}
            animate={{
              x: [0, (index % 2 === 0 ? 1 : -1) * 25, 0],
              y: [0, (index % 2 === 0 ? -1 : 1) * 20, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              repeat: Infinity,
              duration,
              delay: animationDelay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
