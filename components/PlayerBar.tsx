"use client";

import { useMemo } from "react";
import { Player } from "../app/types";

interface PlayerBarProps {
  players: Player[];
  currentPlayerIndex: number;
}

export default function PlayerBar({ players, currentPlayerIndex }: PlayerBarProps) {
  const playerChips = useMemo(
    () =>
      players.map((p, i) => ({
        name: p.name,
        isActive: i === currentPlayerIndex,
        streak: p.streak,
        showStreak: p.streak >= 3,
      })),
    [players, currentPlayerIndex]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        marginBottom: "16px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}
    >
      {playerChips.map((p, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            padding: "6px 12px",
            borderRadius: "20px",
            border: `2px solid ${p.isActive ? "#ec4899" : "#333"}`,
            background: p.isActive ? "#ec489920" : "transparent",
            color: p.isActive ? "#ec4899" : "#555",
            fontSize: "0.8rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
          }}
        >
          {p.name}
          {p.showStreak && (
            <span
              title={`${p.streak}-answer streak!`}
              style={{ marginLeft: "4px" }}
            >
              {"🔥".repeat(Math.min(p.streak - 2, 3))}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
