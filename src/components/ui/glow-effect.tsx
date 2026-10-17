"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlowEffectProps {
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "static";
  blur?: "soft" | "medium" | "strong" | "strongest" | number;
  duration?: number;
  scale?: number;
  className?: string;
}

const BLUR_MAP: Record<string, string> = {
  soft: "12px",
  medium: "20px",
  strong: "32px",
  strongest: "48px",
};

export function GlowEffect({
  colors = ["#ff96a9", "#e8b4f0", "#ffb3c6", "#d44d8a", "#ff96a9"],
  mode = "rotate",
  blur = "strongest",
  duration = 5,
  scale = 1,
  className,
}: GlowEffectProps) {
  const blurValue = typeof blur === "number" ? `${blur}px` : (BLUR_MAP[blur] || "32px");
  const gradientString = colors.length > 1 ? colors.join(", ") : `${colors[0]}, ${colors[0]}`;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {mode === "rotate" && (
        <motion.div
          className="absolute -inset-[100%] m-auto aspect-square w-[300%]"
          style={{
            background: `conic-gradient(from 0deg, ${gradientString})`,
            filter: `blur(${blurValue})`,
            scale,
          }}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration,
            ease: "linear",
          }}
        />
      )}

      {mode === "pulse" && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientString})`,
            filter: `blur(${blurValue})`,
            scale,
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{
            repeat: Infinity,
            duration,
            ease: "easeInOut",
          }}
        />
      )}

      {mode === "breathe" && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientString})`,
            filter: `blur(${blurValue})`,
          }}
          animate={{ scale: [scale * 0.9, scale * 1.1, scale * 0.9] }}
          transition={{
            repeat: Infinity,
            duration,
            ease: "easeInOut",
          }}
        />
      )}

      {mode === "static" && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientString})`,
            filter: `blur(${blurValue})`,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  );
}
