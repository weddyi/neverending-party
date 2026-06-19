"use client";

import { GameState, ReactionType } from "../app/types";
import ConfettiRain from "./ConfettiRain";

interface EndScreenProps {
  game: GameState;
  showConfetti: boolean;
  onPlayAgain: () => void;
}

export default function EndScreen({ game, showConfetti, onPlayAgain }: EndScreenProps) {
  const sortedByAnswered = [...game.players].sort((a, b) => b.answered - a.answered);
  const mostSkipped = [...game.players].sort((a, b) => b.skips - a.skips)[0];
  const hotStreak = [...game.players].sort((a, b) => b.maxStreak - a.maxStreak)[0];
  const mostShocking = [...game.players].sort(
    (a, b) =>
      (b.reactions as Record<ReactionType, number>).shocking -
      (a.reactions as Record<ReactionType, number>).shocking
  )[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        maxWidth: "500px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      {showConfetti && <ConfettiRain />}
      <div className="bounce-in" style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: "70px", marginBottom: "8px" }}>🎉</div>
        <h1
          style={{
            color: "#ec4899",
            fontSize: "2rem",
            fontWeight: 900,
            marginBottom: "4px",
            fontFamily: "'Fredoka One', cursive",
          }}
        >
          Game Over!
        </h1>
        <p style={{ color: "#888", marginBottom: "24px" }}>
          {game.totalQuestions} spicy questions survived
        </p>

        {/* Leaderboard */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e88, #0f0f1a88)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
            width: "100%",
            backdropFilter: "blur(10px)",
            border: "1px solid #333",
          }}
        >
          <h3 style={{ color: "#f59e0b", marginBottom: "16px", fontWeight: 700 }}>
            Final Standings
          </h3>
          {sortedByAnswered.map((p, i) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: i < sortedByAnswered.length - 1 ? "1px solid #333" : "none",
              }}
            >
              <span style={{ color: i === 0 ? "#f59e0b" : "white" }}>
                {i === 0 ? "👑" : `${i + 1}.`} {p.name}
                {p.maxStreak >= 5 && " 🔥"}
              </span>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>
                {p.answered} answered · {p.skips} skipped
              </span>
            </div>
          ))}
        </div>

        {/* Fun stats */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a0a2e88, #0f0f1a88)",
            border: "1px solid #8b5cf644",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backdropFilter: "blur(10px)",
          }}
        >
          {mostSkipped.skips > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>😅 Biggest Skipper</span>
              <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.85rem" }}>
                {mostSkipped.name} ({mostSkipped.skips}x)
              </span>
            </div>
          )}
          {hotStreak.maxStreak >= 3 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>🔥 Best Streak</span>
              <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.85rem" }}>
                {hotStreak.name} ({hotStreak.maxStreak} in a row)
              </span>
            </div>
          )}
          {mostShocking.reactions.shocking > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>😮 Most Shocking</span>
              <span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.85rem" }}>
                {mostShocking.name}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button
            onClick={onPlayAgain}
            style={{
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "18px",
              fontSize: "1.1rem",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Fredoka One', cursive",
            }}
          >
            Play Again 🎲
          </button>
        </div>
      </div>
    </div>
  );
}
