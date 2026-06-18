"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Vibe, Category, Screen, Player, GameState } from "./types";

const CATEGORIES: Category[] = [
  "Truth",
  "Dare",
  "Would You Rather",
  "Hot Take",
  "Never Have I Ever",
  "Confess",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Truth: "#3b82f6",
  Dare: "#ef4444",
  "Would You Rather": "#8b5cf6",
  "Hot Take": "#f97316",
  "Never Have I Ever": "#22c55e",
  Confess: "#ec4899",
};

const CATEGORY_EMOJI: Record<Category, string> = {
  Truth: "🔵",
  Dare: "🔴",
  "Would You Rather": "🟣",
  "Hot Take": "🟠",
  "Never Have I Ever": "🟢",
  Confess: "🌸",
};

function getHeatDots(heat: number) {
  const filled = Math.round((heat / 100) * 5);
  return Array.from({ length: 5 }, (_, i) => i < filled);
}

function ConfettiRain() {
  const colors = ["#ec4899", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e", "#3b82f6"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: `${6 + Math.random() * 10}px`,
    shape: Math.random() > 0.5 ? "50%" : "2px",
  }));

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

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 4 }, (_, i) => `Player ${i + 1}`)
  );
  const [vibe, setVibe] = useState<Vibe>("spicy");
  const [game, setGame] = useState<GameState | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [showWildcard, setShowWildcard] = useState(false);
  const [wildcardQuestion, setWildcardQuestion] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [meltdownAlert, setMeltdownAlert] = useState(false);
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  const fetchQuestion = useCallback(
    async (
      category: Category,
      gameVibe: Vibe,
      round: number,
      players: Player[]
    ): Promise<string> => {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          vibe: gameVibe,
          round,
          players: players.map((p) => p.name),
        }),
      });
      const data = await res.json();
      return data.question || "Tell us your most embarrassing secret... right now.";
    },
    []
  );

  const nextCategory = (current: Category, forceDare?: boolean): Category => {
    if (forceDare) return "Dare";
    const idx = CATEGORIES.indexOf(current);
    return CATEGORIES[(idx + 1) % CATEGORIES.length];
  };

  const startGame = useCallback(async () => {
    const players: Player[] = playerNames
      .slice(0, numPlayers)
      .map((name) => ({ name, skips: 0, dares: 0, answered: 0 }));

    const initialState: GameState = {
      players,
      vibe,
      currentPlayerIndex: 0,
      round: 1,
      totalQuestions: 0,
      skipsLeft: 3,
      heatLevel: 0,
      meltdownMode: false,
      meltdownRoundsLeft: 0,
      lastWildcard: 0,
      screen: "game",
      currentQuestion: null,
      currentCategory: "Truth",
      isLoading: true,
      usedQuestions: new Set(),
    };

    setGame(initialState);
    setScreen("game");

    const q = await fetchQuestion("Truth", vibe, 1, players);
    setGame((prev) =>
      prev ? { ...prev, currentQuestion: q, isLoading: false } : prev
    );
  }, [playerNames, numPlayers, vibe, fetchQuestion]);

  const loadNextQuestion = useCallback(
    async (
      state: GameState,
      playerIdx: number,
      newRound: number,
      newCategory: Category,
      isSkip = false
    ) => {
      setGame((prev) =>
        prev ? { ...prev, isLoading: true } : prev
      );
      setCardKey((k) => k + 1);

      const effectiveVibe =
        state.meltdownMode || state.heatLevel >= 100 ? "savage" : state.vibe;

      const q = await fetchQuestion(newCategory, effectiveVibe, newRound, state.players);
      usedQuestionsRef.current.add(q);

      const newHeat = Math.min(100, state.heatLevel + (isSkip ? 2 : 5));
      const newMeltdown =
        newHeat >= 100 && !state.meltdownMode
          ? true
          : state.meltdownMode && state.meltdownRoundsLeft > 0;
      const newMeltdownRounds = newMeltdown
        ? state.meltdownMode
          ? state.meltdownRoundsLeft - 1
          : 5
        : 0;

      const shouldShowMeltdown = newHeat >= 100 && !state.meltdownMode;

      setGame((prev) =>
        prev
          ? {
              ...prev,
              currentQuestion: q,
              currentCategory: newCategory,
              currentPlayerIndex: playerIdx,
              round: newRound,
              heatLevel: newMeltdownRounds === 0 && state.meltdownMode ? 10 : newHeat,
              meltdownMode: newMeltdownRounds > 0,
              meltdownRoundsLeft: newMeltdownRounds,
              isLoading: false,
            }
          : prev
      );

      if (shouldShowMeltdown) {
        setMeltdownAlert(true);
        setTimeout(() => setMeltdownAlert(false), 3000);
      }
    },
    [fetchQuestion]
  );

  const handleAnswered = useCallback(async () => {
    if (!game || game.isLoading) return;

    const updatedPlayers = game.players.map((p, i) =>
      i === game.currentPlayerIndex ? { ...p, answered: p.answered + 1 } : p
    );

    const nextPlayerIdx = (game.currentPlayerIndex + 1) % game.players.length;
    const newRound =
      nextPlayerIdx === 0 ? game.round + 1 : game.round;
    const newTotal = game.totalQuestions + 1;
    const newCategory = nextCategory(game.currentCategory);

    // Check wildcard (every 5 rounds total questions across all players)
    const showWild = newTotal > 0 && newTotal % (game.players.length * 5) === 0;
    if (showWild) {
      setShowWildcard(true);
      setGame((prev) =>
        prev ? { ...prev, players: updatedPlayers, totalQuestions: newTotal } : prev
      );
      return;
    }

    // Check round end (every 10 questions per player = players.length * 10 total)
    if (newTotal % (game.players.length * 10) === 0) {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              players: updatedPlayers,
              totalQuestions: newTotal,
              currentPlayerIndex: nextPlayerIdx,
              round: newRound,
            }
          : prev
      );
      setScreen("roundend");
      return;
    }

    setGame((prev) =>
      prev ? { ...prev, players: updatedPlayers, totalQuestions: newTotal, skipsLeft: 3 } : prev
    );

    await loadNextQuestion(
      { ...game, players: updatedPlayers },
      nextPlayerIdx,
      newRound,
      newCategory
    );
  }, [game, loadNextQuestion]);

  const handleSkip = useCallback(async () => {
    if (!game || game.isLoading || game.skipsLeft <= 0) return;

    const updatedPlayers = game.players.map((p, i) =>
      i === game.currentPlayerIndex ? { ...p, skips: p.skips + 1 } : p
    );

    setGame((prev) =>
      prev
        ? { ...prev, players: updatedPlayers, skipsLeft: prev.skipsLeft - 1 }
        : prev
    );

    await loadNextQuestion(
      { ...game, players: updatedPlayers, skipsLeft: game.skipsLeft - 1 },
      game.currentPlayerIndex,
      game.round,
      game.currentCategory,
      true
    );
  }, [game, loadNextQuestion]);

  const handleDare = useCallback(async () => {
    if (!game || game.isLoading) return;
    await loadNextQuestion(
      game,
      game.currentPlayerIndex,
      game.round,
      "Dare"
    );
  }, [game, loadNextQuestion]);

  const handleWildcard = useCallback(async () => {
    setShowWildcard(false);
    if (!game) return;

    setGame((prev) => prev ? { ...prev, isLoading: true } : prev);
    const q = await fetchQuestion("Dare", "savage", game.round, game.players);
    setWildcardQuestion(q);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, [game, fetchQuestion]);

  const dismissWildcard = useCallback(async () => {
    setWildcardQuestion(null);
    if (!game) return;
    const nextPlayerIdx = (game.currentPlayerIndex + 1) % game.players.length;
    const newRound = nextPlayerIdx === 0 ? game.round + 1 : game.round;
    const newCategory = nextCategory(game.currentCategory);
    await loadNextQuestion(game, nextPlayerIdx, newRound, newCategory);
  }, [game, loadNextQuestion]);

  const keepPlaying = useCallback(async () => {
    if (!game) return;
    setScreen("game");
    const newCategory = nextCategory(game.currentCategory);
    await loadNextQuestion(game, game.currentPlayerIndex, game.round, newCategory);
  }, [game, loadNextQuestion]);

  const endGame = useCallback(() => {
    setScreen("endgame");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const resetGame = useCallback(() => {
    setGame(null);
    setScreen("welcome");
    usedQuestionsRef.current = new Set();
    setShowWildcard(false);
    setWildcardQuestion(null);
    setShowConfetti(false);
  }, []);

  // Update numPlayers and playerNames together
  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) updated.push(`Player ${updated.length + 1}`);
      return updated.slice(0, n);
    });
  };

  // ── SCREENS ──────────────────────────────────────────────

  if (screen === "welcome") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0f 70%)",
        }}
      >
        {/* Floating emoji */}
        <div className="float-anim" style={{ fontSize: "80px", marginBottom: "16px" }}>
          🎉
        </div>

        <h1
          className="neon-text"
          style={{
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            fontWeight: 900,
            color: "#ec4899",
            textAlign: "center",
            marginBottom: "8px",
            letterSpacing: "-1px",
          }}
        >
          NeverEnding Party
        </h1>

        <div
          style={{
            background: "#1a0a0f",
            border: "2px solid #ec4899",
            borderRadius: "16px",
            padding: "20px",
            maxWidth: "380px",
            width: "100%",
            margin: "24px 0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔞</div>
          <h2 style={{ color: "#f59e0b", fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
            Adults Only — 18+
          </h2>
          <p style={{ color: "#ec4899", fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>
            Spicy questions, real conversations, zero filter
          </p>
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.5 }}>
            This game contains mature themes. All players must consent to participate.
            Play responsibly and respect boundaries.
          </p>
        </div>

        <button
          onClick={() => setScreen("setup")}
          className="glow-pink"
          style={{
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "18px 40px",
            fontSize: "1.1rem",
            fontWeight: 800,
            cursor: "pointer",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          I&apos;m 18+ and ready to play 🎉
        </button>

        <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "16px", textAlign: "center" }}>
          Any resemblance to your actual secrets is entirely intentional.
        </p>
      </div>
    );
  }

  if (screen === "setup") {
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
        }}
      >
        <h1 style={{ color: "#ec4899", fontSize: "1.8rem", fontWeight: 900, marginBottom: "24px" }}>
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
                onClick={() => handleNumPlayersChange(n)}
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
                onChange={(e) => {
                  const updated = [...playerNames];
                  updated[i] = e.target.value || `Player ${i + 1}`;
                  setPlayerNames(updated);
                }}
                placeholder={`Player ${i + 1}`}
                style={{
                  background: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  width: "100%",
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
                onClick={() => setVibe(val)}
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
          onClick={startGame}
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
          }}
        >
          Start the Party →
        </button>
      </div>
    );
  }

  if (screen === "game" && game) {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const catColor = CATEGORY_COLORS[game.currentCategory];
    const heatDots = getHeatDots(game.heatLevel);

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          maxWidth: "500px",
          margin: "0 auto",
          background: game.meltdownMode
            ? "radial-gradient(ellipse at center, #2d0a0a 0%, #0a0a0f 70%)"
            : "#0a0a0f",
        }}
      >
        {showConfetti && <ConfettiRain />}

        {/* Meltdown alert */}
        {meltdownAlert && (
          <div
            className="bounce-in"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#1a0000",
              border: "3px solid #ef4444",
              borderRadius: "20px",
              padding: "24px 32px",
              zIndex: 1000,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "60px" }}>🔥</div>
            <div style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: 900 }}>
              MELTDOWN MODE!
            </div>
            <div style={{ color: "#aaa", marginTop: "8px" }}>Savage questions only!</div>
          </div>
        )}

        {/* Wildcard overlay */}
        {showWildcard && !wildcardQuestion && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#00000099",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 500,
              padding: "24px",
            }}
          >
            <div
              className="bounce-in"
              style={{
                background: "linear-gradient(135deg, #1a0a2e, #2d0a1a)",
                border: "3px solid #f59e0b",
                borderRadius: "24px",
                padding: "32px",
                textAlign: "center",
                maxWidth: "360px",
                width: "100%",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "8px" }}>🃏</div>
              <h2 style={{ color: "#f59e0b", fontSize: "1.5rem", fontWeight: 900, marginBottom: "8px" }}>
                WILDCARD!
              </h2>
              <p style={{ color: "#aaa", marginBottom: "24px" }}>
                A group challenge — everyone participates!
              </p>
              <button
                onClick={handleWildcard}
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "14px 32px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Reveal the Challenge 🎲
              </button>
            </div>
          </div>
        )}

        {/* Wildcard question */}
        {wildcardQuestion && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#00000099",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 500,
              padding: "24px",
            }}
          >
            {showConfetti && <ConfettiRain />}
            <div
              className="bounce-in"
              style={{
                background: "linear-gradient(135deg, #1a0a2e, #2d0a1a)",
                border: "3px solid #f59e0b",
                borderRadius: "24px",
                padding: "32px",
                textAlign: "center",
                maxWidth: "380px",
                width: "100%",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🃏</div>
              <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "12px" }}>
                GROUP CHALLENGE
              </div>
              <p style={{ color: "white", fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", lineHeight: 1.4 }}>
                {wildcardQuestion}
              </p>
              <button
                onClick={dismissWildcard}
                style={{
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "14px 32px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Done! Next Question →
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <div style={{ color: "#888", fontSize: "0.75rem", fontWeight: 600 }}>
              Round {game.round} • Q{game.totalQuestions + 1}
            </div>
            <div style={{ color: "#ec4899", fontSize: "1.1rem", fontWeight: 900 }}>
              {currentPlayer.name}&apos;s turn
            </div>
          </div>

          {/* Heat meter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <div style={{ color: "#888", fontSize: "0.7rem" }}>
              {game.meltdownMode ? "🔥 MELTDOWN" : `Heat ${game.heatLevel}%`}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {heatDots.map((filled, i) => (
                <div
                  key={i}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: filled ? (game.meltdownMode ? "#ef4444" : "#f59e0b") : "#333",
                    boxShadow: filled && game.meltdownMode ? "0 0 8px #ef4444" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Player turn row */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "16px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {game.players.map((p, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: "20px",
                border: `2px solid ${i === game.currentPlayerIndex ? "#ec4899" : "#333"}`,
                background: i === game.currentPlayerIndex ? "#ec489920" : "transparent",
                color: i === game.currentPlayerIndex ? "#ec4899" : "#555",
                fontSize: "0.8rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {p.name}
            </div>
          ))}
        </div>

        {/* Question card */}
        <div
          key={cardKey}
          className="card-flip"
          style={{
            flex: 1,
            background: game.meltdownMode
              ? "linear-gradient(135deg, #2d0a0a, #1a0000)"
              : "linear-gradient(135deg, #1a0a2e, #0f0a1a)",
            border: `2px solid ${game.meltdownMode ? "#ef4444" : catColor}`,
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            minHeight: "300px",
            boxShadow: `0 0 30px ${catColor}33`,
            marginBottom: "16px",
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
                border: `1px solid ${catColor}`,
                color: catColor,
                borderRadius: "20px",
                padding: "4px 14px",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {CATEGORY_EMOJI[game.currentCategory]} {game.currentCategory}
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
                <div style={{ color: "#888", marginTop: "8px" }}>Generating...</div>
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
                  opacity:
                    i < (game.round <= 3 ? 1 : game.round <= 7 ? 2 : 3) ? 1 : 0.2,
                  fontSize: "0.9rem",
                }}
              >
                🌶️
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleAnswered}
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
            }}
          >
            ✓ Answered
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSkip}
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
                cursor:
                  game.isLoading || game.skipsLeft <= 0 ? "not-allowed" : "pointer",
              }}
            >
              ⏭️ Skip ({game.skipsLeft})
            </button>

            <button
              onClick={handleDare}
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
            onClick={endGame}
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
        </div>
      </div>
    );
  }

  if (screen === "roundend" && game) {
    const mostSkipped = [...game.players].sort((a, b) => b.skips - a.skips)[0];
    const mostDaring = [...game.players].sort((a, b) => b.dares - a.dares)[0];
    const mostAnswered = [...game.players].sort((a, b) => b.answered - a.answered)[0];

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
        }}
      >
        <div className="bounce-in" style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: "60px", marginBottom: "8px" }}>📊</div>
          <h2 style={{ color: "#f59e0b", fontSize: "1.5rem", fontWeight: 900, marginBottom: "4px" }}>
            Round {game.round} Stats
          </h2>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            {game.totalQuestions} questions asked
          </p>

          <div
            style={{
              background: "#1a1a2e",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "24px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888" }}>👑 Most Answers</span>
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>{mostAnswered.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888" }}>😂 Biggest Skipper</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>
                  {mostSkipped.skips > 0 ? `${mostSkipped.name} (${mostSkipped.skips}x)` : "Nobody! 👏"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888" }}>🔥 Heat Level</span>
                <span style={{ color: "#ec4899", fontWeight: 700 }}>{game.heatLevel}%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <button
              onClick={keepPlaying}
              style={{
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "18px",
                fontSize: "1.1rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Keep Playing 🎉
            </button>
            <button
              onClick={endGame}
              style={{
                background: "transparent",
                color: "#888",
                border: "1px solid #333",
                borderRadius: "50px",
                padding: "16px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "endgame" && game) {
    const sortedByAnswered = [...game.players].sort((a, b) => b.answered - a.answered);
    const mostSkipped = [...game.players].sort((a, b) => b.skips - a.skips)[0];

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
        }}
      >
        {showConfetti && <ConfettiRain />}
        <div className="bounce-in" style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: "70px", marginBottom: "8px" }}>🎉</div>
          <h1 style={{ color: "#ec4899", fontSize: "2rem", fontWeight: 900, marginBottom: "4px" }}>
            Game Over!
          </h1>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            {game.totalQuestions} spicy questions survived
          </p>

          {/* Leaderboard */}
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "16px",
              width: "100%",
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
                </span>
                <span style={{ color: "#888", fontSize: "0.85rem" }}>
                  {p.answered} answered · {p.skips} skipped
                </span>
              </div>
            ))}
          </div>

          {mostSkipped.skips > 0 && (
            <div
              style={{
                background: "#1a0a0a",
                border: "1px solid #ef444444",
                borderRadius: "16px",
                padding: "14px",
                marginBottom: "24px",
                color: "#ef4444",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              🏆 Biggest Skipper: {mostSkipped.name} ({mostSkipped.skips} skips)
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <button
              onClick={resetGame}
              style={{
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "18px",
                fontSize: "1.1rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Play Again 🎲
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
