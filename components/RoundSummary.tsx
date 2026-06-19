"use client";

import { GameState, ReactionType } from "../app/types";

interface RoundSummaryProps {
  game: GameState;
  onKeepPlaying: () => void;
  onEnd: () => void;
}

export default function RoundSummary({ game, onKeepPlaying, onEnd }: RoundSummaryProps) {
  const mostDaring = [...game.players].sort((a, b) => b.dares - a.dares)[0];
  const biggestSkipper = [...game.players].sort((a, b) => b.skips - a.skips)[0];
  const hotStreak = [...game.players].sort((a, b) => b.maxStreak - a.maxStreak)[0];

  // Most shocking: player with most "shocking" reactions
  const mostShocking = [...game.players].sort(
    (a, b) => (b.reactions as Record<ReactionType, number>).shocking - (a.reactions as Record<ReactionType, number>).shocking
  )[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000cc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 600,
        padding: "24px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="bounce-in"
        style={{
          background: "linear-gradient(135deg, #1a0a2e, #0f0f1a)",
          border: "2px solid #f59e0b",
          borderRadius: "24px",
          padding: "28px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 0 40px #f59e0b33",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "48px" }}>📊</div>
          <h2 style={{ color: "#f59e0b", fontSize: "1.4rem", fontWeight: 900, marginTop: "8px" }}>
            Round Check-in
          </h2>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>
            {game.totalQuestions} questions played
          </p>
        </div>

        <div
          style={{
            background: "#0f0f1a",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <StatRow
            icon="🏆"
            label="Most Daring"
            value={mostDaring.dares > 0 ? mostDaring.name : "Nobody yet!"}
          />
          <StatRow
            icon="😅"
            label="Biggest Skipper"
            value={
              biggestSkipper.skips > 0
                ? `${biggestSkipper.name} (${biggestSkipper.skips}x)`
                : "Nobody skipped! 👏"
            }
          />
          <StatRow
            icon="🔥"
            label="Hottest Streak"
            value={
              hotStreak.maxStreak >= 3
                ? `${hotStreak.name} (${hotStreak.maxStreak} in a row)`
                : "No streaks yet"
            }
          />
          {mostShocking.reactions.shocking > 0 && (
            <StatRow
              icon="😮"
              label="Most Shocking"
              value={`${mostShocking.name}`}
            />
          )}
          <StatRow
            icon="🌡️"
            label="Heat Level"
            value={`${game.heatLevel}%${game.meltdownMode ? " 🔥 MELTDOWN" : ""}`}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onKeepPlaying}
            style={{
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "16px",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Keep Going 🎉
          </button>
          <button
            onClick={onEnd}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #333",
              borderRadius: "50px",
              padding: "14px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            End It Here
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#888", fontSize: "0.85rem" }}>
        {icon} {label}
      </span>
      <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", textAlign: "right", maxWidth: "55%" }}>
        {value}
      </span>
    </div>
  );
}
