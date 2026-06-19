"use client";

import { useMemo } from "react";
import { GameState, ReactionType } from "../app/types";
import QuestionCard from "./QuestionCard";
import HeatMeter from "./HeatMeter";
import PlayerBar from "./PlayerBar";
import WildcardOverlay from "./WildcardOverlay";
import RoundSummary from "./RoundSummary";
import ConfettiRain from "./ConfettiRain";

interface GameScreenProps {
  game: GameState;
  cardKey: number;
  showWildcard: boolean;
  wildcardQuestion: string | null;
  showConfetti: boolean;
  meltdownAlert: boolean;
  showRoundSummary: boolean;
  onAnswered: () => void;
  onSkip: () => void;
  onDare: () => void;
  onEndGame: () => void;
  onReaction: (type: ReactionType) => void;
  onWildcardReveal: () => void;
  onWildcardDismiss: () => void;
  onRoundSummaryContinue: (keep: boolean) => void;
}

export default function GameScreen({
  game,
  cardKey,
  showWildcard,
  wildcardQuestion,
  showConfetti,
  meltdownAlert,
  showRoundSummary,
  onAnswered,
  onSkip,
  onDare,
  onEndGame,
  onReaction,
  onWildcardReveal,
  onWildcardDismiss,
  onRoundSummaryContinue,
}: GameScreenProps) {
  const currentPlayer = useMemo(
    () => game.players[game.currentPlayerIndex],
    [game.players, game.currentPlayerIndex]
  );

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
          : "transparent",
        position: "relative",
        zIndex: 1,
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
            background: "linear-gradient(135deg, #2d0000, #1a0000)",
            border: "3px solid #ef4444",
            borderRadius: "20px",
            padding: "24px 32px",
            zIndex: 1000,
            textAlign: "center",
            boxShadow: "0 0 60px #ef444466",
          }}
        >
          <div style={{ fontSize: "60px" }}>🔥</div>
          <div style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: 900 }}>
            MELTDOWN MODE!
          </div>
          <div style={{ color: "#aaa", marginTop: "8px" }}>Savage questions only!</div>
        </div>
      )}

      {/* Overlays */}
      {(showWildcard || wildcardQuestion) && (
        <WildcardOverlay
          wildcardQuestion={wildcardQuestion}
          onReveal={onWildcardReveal}
          onDismiss={onWildcardDismiss}
        />
      )}

      {showRoundSummary && (
        <RoundSummary
          game={game}
          onKeepPlaying={() => onRoundSummaryContinue(true)}
          onEnd={() => onRoundSummaryContinue(false)}
        />
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
        <HeatMeter heat={game.heatLevel} meltdownMode={game.meltdownMode} />
      </div>

      <PlayerBar players={game.players} currentPlayerIndex={game.currentPlayerIndex} />

      <QuestionCard
        game={game}
        cardKey={cardKey}
        onAnswered={onAnswered}
        onSkip={onSkip}
        onDare={onDare}
        onEndGame={onEndGame}
        onReaction={onReaction}
      />
    </div>
  );
}
