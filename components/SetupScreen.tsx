"use client";

import { Vibe } from "../app/types";

interface SetupScreenProps {
  numPlayers: number;
  playerNames: string[];
  vibe: Vibe;
  onNumPlayersChange: (n: number) => void;
  onPlayerNameChange: (i: number, name: string) => void;
  onVibeChange: (v: Vibe) => void;
  onStart: () => void;
}

export default function SetupScreen({
  numPlayers,
  playerNames,
  vibe,
  onNumPlayersChange,
  onPlayerNameChange,
  onVibeChange,
  onStart,
}: SetupScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        maxWidth: "500px",
        margin: "0 auto",
        paddingTop: "40px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <h1
        style={{
          color: "#ec4899",
          fontSize: "1.8rem",
          fontWeight: 900,
          marginBottom: "24px",
          fontFamily: "'Fredoka One', cursive",
        }}
      >
        🎲 Game Setup
      </h1>

      {/* Number of players */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "12px", display: "block" }}>
          How many players?
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
            <button
              key={n}
              onClick={() => onNumPlayersChange(n)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                border: `2px solid ${numPlayers === n ? "#ec4899" : "#333"}`,
                background: numPlayers === n ? "#ec489920" : "transparent",
                color: numPlayers === n ? "#ec4899" : "#888",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Player names */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "12px", display: "block" }}>
          Player Names
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: numPlayers }, (_, i) => (
            <input
              key={i}
              value={playerNames[i] || `Player ${i + 1}`}
              onChange={(e) => onPlayerNameChange(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
              style={{
                background: "#1a1a2e88",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "12px 16px",
                color: "white",
                fontSize: "1rem",
                outline: "none",
                width: "100%",
                backdropFilter: "blur(4px)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ec4899")}
              onBlur={(e) => (e.target.style.borderColor = "#333")}
            />
          ))}
        </div>
      </div>

      {/* Game vibe */}
      <div style={{ marginBottom: "32px" }}>
        <label style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "12px", display: "block" }}>
          Game Vibe
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(
            [
              { val: "mild", emoji: "🌶️", label: "Mild", desc: "fun and cheeky" },
              { val: "spicy", emoji: "🔥", label: "Spicy", desc: "bold and daring" },
              { val: "savage", emoji: "💀", label: "Savage", desc: "no mercy" },
            ] as const
          ).map(({ val, emoji, label, desc }) => (
            <button
              key={val}
              onClick={() => onVibeChange(val)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                border: `2px solid ${vibe === val ? "#ec4899" : "#333"}`,
                background: vibe === val ? "#ec489915" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
              <div>
                <div style={{ color: vibe === val ? "#ec4899" : "white", fontWeight: 700 }}>
                  {label}
                </div>
                <div style={{ color: "#888", fontSize: "0.85rem" }}>{desc}</div>
              </div>
              {vibe === val && (
                <span style={{ marginLeft: "auto", color: "#ec4899" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "18px",
          fontSize: "1.1rem",
          fontWeight: 800,
          cursor: "pointer",
          width: "100%",
          fontFamily: "'Fredoka One', cursive",
        }}
      >
        Start the Party →
      </button>
    </div>
  );
}
