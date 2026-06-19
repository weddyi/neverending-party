"use client";

import { useMemo } from "react";

interface HeatMeterProps {
  heat: number;
  meltdownMode: boolean;
}

export default function HeatMeter({ heat, meltdownMode }: HeatMeterProps) {
  const barColor = useMemo(() => {
    if (meltdownMode) return "#ef4444";
    if (heat > 75) return "#f97316";
    if (heat > 50) return "#f59e0b";
    return "#ec4899";
  }, [heat, meltdownMode]);

  const label = meltdownMode ? "🔥 MELTDOWN" : `Heat ${heat}%`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
      <div style={{ color: meltdownMode ? "#ef4444" : "#888", fontSize: "0.7rem", fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          width: "80px",
          height: "8px",
          background: "#1a1a2e",
          borderRadius: "4px",
          overflow: "hidden",
          border: `1px solid ${barColor}44`,
        }}
      >
        <div
          className={meltdownMode ? "heat-bar-meltdown" : "heat-bar"}
          style={{
            height: "100%",
            width: `${heat}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            borderRadius: "4px",
            boxShadow: `0 0 8px ${barColor}`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
