"use client";

import { GameState, CATEGORY_COLORS, CATEGORY_GRADIENTS, CATEGORY_EMOJI, REACTIONS, ReactionType } from "../app/types";

interface QuestionCardProps {
  game: GameState;
  cardKey: number;
  onAnswered: () => void;
  onSkip: () => void;
  onDare: () => void;
  onEndGame: () => void;
  onReaction: (type: ReactionType) => void;
}

export default function QuestionCard({
  game,
  cardKey,
  onAnswered,
  onSkip,
  onDare,
  onEndGame,
  onReaction,
}: QuestionCardProps) {
  const catColor = CATEGORY_COLORS[game.currentCategory];
  const [gradFrom, gradTo] = CATEGORY_GRADIENTS[game.currentCategory];
  const catEmoji = CATEGORY_EMOJI[game.currentCategory];
  const currentPlayer = game.players[game.currentPlayerIndex];
  const streakCount = currentPlayer.streak;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Question card */}
      <div
        key={cardKey}
        className="card-flip"
        style={{
          background: game.meltdownMode
            ? "linear-gradient(135deg, #2d0a0a, #1a0000)"
            : `linear-gradient(135deg, ${gradFrom}cc, ${gradTo}33)`,
          border: `2px solid ${game.meltdownMode ? "#ef4444" : catColor}`,
          borderRadius: "24px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          minHeight: "280px",
          boxShadow: `0 0 30px ${catColor}44, inset 0 0 40px ${catColor}11`,
          backdropFilter: "blur(10px)",
          marginBottom: "4px",
        }}
      >
        {/* Category badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              background: `${catColor}22`,
              border: `1px solid ${catColor}88`,
              color: catColor,
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {catEmoji} {game.currentCategory}
          </span>

          {game.meltdownMode && (
            <span
              style={{
                color: "#ef4444",
                fontSize: "0.8rem",
                fontWeight: 700,
                animation: "heat-pulse 1s infinite",
              }}
            >
              🔥 MELTDOWN
            </span>
          )}

          {streakCount >= 3 && !game.meltdownMode && (
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b" }}>
              {streakCount} streak 🔥
            </span>
          )}
        </div>

        {/* Question text */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {game.isLoading ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <div
                style={{
                  fontSize: "40px",
                  animation: "float 1s ease-in-out infinite",
                }}
              >
                🎲
              </div>
              <div style={{ color: "#888", marginTop: "8px", fontSize: "0.9rem" }}>
                Loading next question...
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
                fontWeight: 700,
                lineHeight: 1.5,
                color: "white",
              }}
            >
              {game.currentQuestion}
            </p>
          )}
        </div>

        {/* Difficulty dots */}
        <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              style={{
                opacity: i < (game.round <= 3 ? 1 : game.round <= 7 ? 2 : 3) ? 1 : 0.2,
                fontSize: "0.9rem",
              }}
            >
              🌶️
            </span>
          ))}
        </div>
      </div>

      {/* Reaction buttons (shown after answering) */}
      {game.showReactions && (
        <div
          className="bounce-in"
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px",
            background: "#1a1a2e",
            borderRadius: "16px",
            border: "1px solid #333",
            justifyContent: "center",
          }}
        >
          <div style={{ color: "#888", fontSize: "0.75rem", width: "100%", textAlign: "center", marginBottom: "6px" }}>
            React to this question:
          </div>
          <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "center" }}>
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => onReaction(r.type)}
                style={{
                  flex: 1,
                  background: "#0f0f1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "10px 4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{r.emoji}</span>
                <span style={{ color: "#888", fontSize: "0.65rem" }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!game.showReactions && (
        <>
          <button
            onClick={onAnswered}
            disabled={game.isLoading}
            style={{
              background: game.isLoading
                ? "#333"
                : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              padding: "16px",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: game.isLoading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            ✓ Answered
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onSkip}
              disabled={game.isLoading || game.skipsLeft <= 0}
              style={{
                flex: 1,
                background: game.skipsLeft <= 0 ? "#1a1a1a" : "#1a1a2e",
                color: game.skipsLeft <= 0 ? "#444" : "#f59e0b",
                border: `1px solid ${game.skipsLeft <= 0 ? "#333" : "#f59e0b44"}`,
                borderRadius: "16px",
                padding: "14px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: game.isLoading || game.skipsLeft <= 0 ? "not-allowed" : "pointer",
              }}
            >
              ⏭️ Skip ({game.skipsLeft})
            </button>

            <button
              onClick={onDare}
              disabled={game.isLoading}
              style={{
                flex: 1,
                background: "#1a0a0a",
                color: "#ef4444",
                border: "1px solid #ef444444",
                borderRadius: "16px",
                padding: "14px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: game.isLoading ? "not-allowed" : "pointer",
              }}
            >
              🎲 Dare!
            </button>
          </div>

          <button
            onClick={onEndGame}
            style={{
              background: "transparent",
              color: "#555",
              border: "none",
              padding: "8px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            End Game
          </button>
        </>
      )}
    </div>
  );
}
