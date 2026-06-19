"use client";

import { useMemo } from "react";

export default function ConfettiRain() {
  const pieces = useMemo(() => {
    const colors = ["#ec4899", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e", "#3b82f6"];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${(i * 1.7 + 1) % 100}%`,
      delay: `${(i * 0.05) % 2}s`,
      duration: `${2.5 + (i % 4) * 0.5}s`,
      size: `${6 + (i % 8)}px`,
      shape: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%",
    }));
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
