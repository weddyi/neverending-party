"use client";

import { useGame } from "../hooks/useGame";
import ParticleBackground from "../components/ParticleBackground";
import WelcomeScreen from "../components/WelcomeScreen";
import SetupScreen from "../components/SetupScreen";
import GameScreen from "../components/GameScreen";
import EndScreen from "../components/EndScreen";

export default function Home() {
  const {
    game,
    screen,
    numPlayers,
    playerNames,
    vibe,
    cardKey,
    showWildcard,
    wildcardQuestion,
    showConfetti,
    meltdownAlert,
    showRoundSummary,
    setNumPlayers,
    setPlayerName,
    setVibe,
    setScreen,
    startGame,
    handleAnswered,
    handleSkip,
    handleDare,
    handleWildcard,
    dismissWildcard,
    endGame,
    resetGame,
    addReaction,
    dismissRoundSummary,
  } = useGame();

  if (screen === "welcome") {
    return (
      <>
        <ParticleBackground />
        <WelcomeScreen onContinue={() => setScreen("setup")} />
      </>
    );
  }

  if (screen === "setup") {
    return (
      <>
        <ParticleBackground />
        <SetupScreen
          numPlayers={numPlayers}
          playerNames={playerNames}
          vibe={vibe}
          onNumPlayersChange={setNumPlayers}
          onPlayerNameChange={setPlayerName}
          onVibeChange={setVibe}
          onStart={startGame}
        />
      </>
    );
  }

  if (screen === "game" && game) {
    return (
      <>
        <ParticleBackground />
        <GameScreen
          game={game}
          cardKey={cardKey}
          showWildcard={showWildcard}
          wildcardQuestion={wildcardQuestion}
          showConfetti={showConfetti}
          meltdownAlert={meltdownAlert}
          showRoundSummary={showRoundSummary}
          onAnswered={handleAnswered}
          onSkip={handleSkip}
          onDare={handleDare}
          onEndGame={endGame}
          onReaction={addReaction}
          onWildcardReveal={handleWildcard}
          onWildcardDismiss={dismissWildcard}
          onRoundSummaryContinue={dismissRoundSummary}
        />
      </>
    );
  }

  if (screen === "endgame" && game) {
    return (
      <>
        <ParticleBackground />
        <EndScreen game={game} showConfetti={showConfetti} onPlayAgain={resetGame} />
      </>
    );
  }

  return null;
}
