"use client";

import { useMemo } from "react";

interface Particle {
  id: number;
  x: string;
  size: string;
  color: string;
  duration: string;
  delay: string;
  opacity: number;
}

export default function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    const colors = ["#ec4899", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6", "#10b981"];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: `${(i * 2.1 + 3) % 100}%`,
      size: `${3 + (i % 5)}px`,
      color: colors[i % colors.length],
      duration: `${8 + (i % 12)}s`,
      delay: `${(i * 0.4) % 10}s`,
      opacity: 0.15 + (i % 5) * 0.05,
    }));
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
