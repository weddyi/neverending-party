"use client";

import { useState, useCallback, useRef } from "react";
import {
  GameState,
  Player,
  Category,
  Vibe,
  Screen,
  ReactionType,
  CATEGORIES,
  QuestionEntry,
} from "../app/types";

// ── Audio ────────────────────────────────────────────────────────────────────

function createAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequencies: number[],
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.3
) {
  const now = ctx.currentTime;
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + (i * duration) / frequencies.length);
    gainNode.gain.setValueAtTime(gain, now + (i * duration) / frequencies.length);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + ((i + 1) * duration) / frequencies.length
    );
    osc.start(now + (i * duration) / frequencies.length);
    osc.stop(now + ((i + 1) * duration) / frequencies.length);
  });
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = createAudioCtx();
    return ctxRef.current;
  }, []);

  const playCardFlip = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, [440, 550, 660], 0.3, "triangle", 0.2);
  }, [getCtx]);

  const playSkip = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, [440, 330, 220], 0.4, "sine", 0.2);
  }, [getCtx]);

  const playWildcard = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, [330, 440, 550, 660, 880], 0.8, "triangle", 0.25);
  }, [getCtx]);

  const playRoundComplete = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    // Celebration chord
    const now = ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }, [getCtx]);

  return { playCardFlip, playSkip, playWildcard, playRoundComplete };
}

// ── Question Queue ───────────────────────────────────────────────────────────

interface QueuedQuestion {
  question: string;
  category: Category;
}

async function fetchQuestion(
  category: Category,
  vibe: Vibe,
  round: number,
  players: Player[]
): Promise<string> {
  const res = await fetch("/api/question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category,
      vibe,
      round,
      players: players.map((p) => p.name),
    }),
  });
  const data = await res.json();
  return data.question || "Tell us your most embarrassing secret... right now.";
}

function makeEmptyPlayer(name: string): Player {
  return {
    name,
    skips: 0,
    dares: 0,
    answered: 0,
    streak: 0,
    maxStreak: 0,
    reactions: { funny: 0, shocking: 0, spicy: 0, bold: 0 },
  };
}

function makeEmptyReactions(): Record<ReactionType, number> {
  return { funny: 0, shocking: 0, spicy: 0, bold: 0 };
}

// ── Shuffle ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface GameHook {
  game: GameState | null;
  screen: Screen;
  numPlayers: number;
  playerNames: string[];
  vibe: Vibe;
  cardKey: number;
  showWildcard: boolean;
  wildcardQuestion: string | null;
  showConfetti: boolean;
  meltdownAlert: boolean;
  showRoundSummary: boolean;
  setNumPlayers: (n: number) => void;
  setPlayerName: (i: number, name: string) => void;
  setVibe: (v: Vibe) => void;
  setScreen: (s: Screen) => void;
  startGame: () => Promise<void>;
  handleAnswered: () => Promise<void>;
  handleSkip: () => Promise<void>;
  handleDare: () => Promise<void>;
  handleWildcard: () => Promise<void>;
  dismissWildcard: () => Promise<void>;
  keepPlaying: () => Promise<void>;
  endGame: () => void;
  resetGame: () => void;
  addReaction: (type: ReactionType) => void;
  dismissRoundSummary: (keepPlaying: boolean) => Promise<void>;
}

export function useGame(): GameHook {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [numPlayers, setNumPlayersState] = useState(4);
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
  const [showRoundSummary, setShowRoundSummary] = useState(false);

  // Per-session randomized category order
  const categoryOrderRef = useRef<Category[]>(shuffleArray(CATEGORIES));

  // Pre-generated question queue: up to 3 ahead
  const queueRef = useRef<QueuedQuestion[]>([]);
  const prefetchingRef = useRef(false);
  const usedQuestionsRef = useRef<Set<string>>(new Set());

  const sounds = useSounds();

  // Prefetch questions into queue
  const prefetchQuestions = useCallback(
    async (
      fromCategory: Category,
      fromPlayerIndex: number,
      roundNum: number,
      players: Player[],
      gameVibe: Vibe,
      isMeltdown: boolean
    ) => {
      if (prefetchingRef.current) return;
      if (queueRef.current.length >= 3) return;
      prefetchingRef.current = true;

      const effectiveVibe = isMeltdown ? "savage" : gameVibe;
      const needed = 3 - queueRef.current.length;
      const catIdx = CATEGORIES.indexOf(fromCategory);

      const fetches = Array.from({ length: needed }, (_, i) => {
        const category = CATEGORIES[(catIdx + i + 1) % CATEGORIES.length];
        const pIdx = (fromPlayerIndex + i + 1) % players.length;
        const r = pIdx < fromPlayerIndex ? roundNum + 1 : roundNum;
        return fetchQuestion(category, effectiveVibe, r, players).then((q) => ({
          question: q,
          category,
        }));
      });

      const results = await Promise.allSettled(fetches);
      results.forEach((r) => {
        if (r.status === "fulfilled") {
          queueRef.current.push(r.value);
        }
      });
      prefetchingRef.current = false;
    },
    []
  );

  const dequeueQuestion = useCallback(
    async (
      category: Category,
      vibe_: Vibe,
      round: number,
      players: Player[],
      isMeltdown: boolean
    ): Promise<string> => {
      // Try exact category match first
      const exactIdx = queueRef.current.findIndex((q) => q.category === category);
      if (exactIdx !== -1) {
        const [item] = queueRef.current.splice(exactIdx, 1);
        return item.question;
      }
      // Fallback: fetch fresh
      return fetchQuestion(category, isMeltdown ? "savage" : vibe_, round, players);
    },
    []
  );

  const setNumPlayers = useCallback((n: number) => {
    setNumPlayersState(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) updated.push(`Player ${updated.length + 1}`);
      return updated.slice(0, n);
    });
  }, []);

  const setPlayerName = useCallback((i: number, name: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[i] = name || `Player ${i + 1}`;
      return updated;
    });
  }, []);

  const nextCategory = useCallback(
    (current: Category, forceDare?: boolean): Category => {
      if (forceDare) return "Dare";
      const order = categoryOrderRef.current;
      const idx = order.indexOf(current);
      return order[(idx + 1) % order.length];
    },
    []
  );

  const startGame = useCallback(async () => {
    // Shuffle player order and category rotation fresh each session
    const shuffledPlayers: Player[] = shuffleArray(playerNames.slice(0, numPlayers)).map(makeEmptyPlayer);
    categoryOrderRef.current = shuffleArray(CATEGORIES);
    queueRef.current = [];
    usedQuestionsRef.current = new Set();

    const firstCategory = categoryOrderRef.current[0];

    const initialState: GameState = {
      players: shuffledPlayers,
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
      currentCategory: firstCategory,
      isLoading: true,
      usedQuestions: new Set(),
      questionHistory: [],
      showReactions: false,
      lastQuestionIndex: -1,
    };

    setGame(initialState);
    setScreen("game");

    // Fetch first question + prefill queue simultaneously
    const [firstQ] = await Promise.all([
      fetchQuestion(firstCategory, vibe, 1, shuffledPlayers),
      prefetchQuestions(firstCategory, 0, 1, shuffledPlayers, vibe, false),
    ]);

    setGame((prev) =>
      prev ? { ...prev, currentQuestion: firstQ, isLoading: false } : prev
    );
  }, [playerNames, numPlayers, vibe, prefetchQuestions]);

  const loadNextQuestion = useCallback(
    async (
      state: GameState,
      playerIdx: number,
      newRound: number,
      newCategory: Category,
      isSkip = false
    ) => {
      setGame((prev) => (prev ? { ...prev, isLoading: true, showReactions: false } : prev));
      setCardKey((k) => k + 1);
      sounds.playCardFlip();

      const isMeltdown = state.meltdownMode || state.heatLevel >= 100;
      const q = await dequeueQuestion(newCategory, state.vibe, newRound, state.players, isMeltdown);
      usedQuestionsRef.current.add(q);

      const newHeat = Math.min(100, state.heatLevel + (isSkip ? 2 : 5));
      const enteringMeltdown = newHeat >= 100 && !state.meltdownMode;
      const newMeltdown = enteringMeltdown || (state.meltdownMode && state.meltdownRoundsLeft > 0);
      const newMeltdownRounds = newMeltdown
        ? state.meltdownMode
          ? state.meltdownRoundsLeft - 1
          : 5
        : 0;
      const resetHeat = newMeltdownRounds === 0 && state.meltdownMode;

      const historyEntry: QuestionEntry = {
        question: q,
        category: newCategory,
        playerIndex: playerIdx,
        round: newRound,
        reactions: makeEmptyReactions(),
      };

      setGame((prev) =>
        prev
          ? {
              ...prev,
              currentQuestion: q,
              currentCategory: newCategory,
              currentPlayerIndex: playerIdx,
              round: newRound,
              heatLevel: resetHeat ? 10 : newHeat,
              meltdownMode: newMeltdownRounds > 0,
              meltdownRoundsLeft: newMeltdownRounds,
              isLoading: false,
              showReactions: false,
              questionHistory: [...prev.questionHistory, historyEntry],
              lastQuestionIndex: prev.questionHistory.length,
            }
          : prev
      );

      if (enteringMeltdown) {
        setMeltdownAlert(true);
        setTimeout(() => setMeltdownAlert(false), 3000);
      }

      // Kick off prefetch for next questions
      prefetchQuestions(newCategory, playerIdx, newRound, state.players, state.vibe, newMeltdown);
    },
    [dequeueQuestion, prefetchQuestions, sounds]
  );

  const handleAnswered = useCallback(async () => {
    if (!game || game.isLoading) return;

    // Show reactions first
    setGame((prev) => (prev ? { ...prev, showReactions: true } : prev));
  }, [game]);

  const addReaction = useCallback(
    (type: ReactionType) => {
      if (!game) return;
      setGame((prev) => {
        if (!prev) return prev;
        const idx = prev.lastQuestionIndex;
        if (idx < 0 || idx >= prev.questionHistory.length) return prev;
        const newHistory = [...prev.questionHistory];
        newHistory[idx] = {
          ...newHistory[idx],
          reactions: { ...newHistory[idx].reactions, [type]: newHistory[idx].reactions[type] + 1 },
        };
        // Also tally on current player
        const newPlayers = prev.players.map((p, i) =>
          i === prev.currentPlayerIndex
            ? { ...p, reactions: { ...p.reactions, [type]: p.reactions[type] + 1 } }
            : p
        );
        return { ...prev, questionHistory: newHistory, players: newPlayers };
      });

      // After reaction, advance
      if (!game) return;
      const updatedPlayers = game.players.map((p, i) => {
        if (i !== game.currentPlayerIndex) return p;
        const newStreak = p.streak + 1;
        return {
          ...p,
          answered: p.answered + 1,
          streak: newStreak,
          maxStreak: Math.max(p.maxStreak, newStreak),
        };
      });

      const nextPlayerIdx = (game.currentPlayerIndex + 1) % game.players.length;
      const newRound = nextPlayerIdx === 0 ? game.round + 1 : game.round;
      const newTotal = game.totalQuestions + 1;
      const newCategory = nextCategory(game.currentCategory);

      // Check wildcard
      const showWild = newTotal > 0 && newTotal % (game.players.length * 5) === 0;
      if (showWild) {
        setShowWildcard(true);
        setGame((prev) =>
          prev
            ? { ...prev, players: updatedPlayers, totalQuestions: newTotal, showReactions: false }
            : prev
        );
        sounds.playWildcard();
        return;
      }

      // Check round summary every 10 turns
      if (newTotal % 10 === 0) {
        setGame((prev) =>
          prev
            ? {
                ...prev,
                players: updatedPlayers,
                totalQuestions: newTotal,
                currentPlayerIndex: nextPlayerIdx,
                round: newRound,
                showReactions: false,
              }
            : prev
        );
        setShowRoundSummary(true);
        sounds.playRoundComplete();
        return;
      }

      setGame((prev) =>
        prev
          ? {
              ...prev,
              players: updatedPlayers,
              totalQuestions: newTotal,
              skipsLeft: 3,
              showReactions: false,
            }
          : prev
      );

      loadNextQuestion(
        { ...game, players: updatedPlayers },
        nextPlayerIdx,
        newRound,
        newCategory
      );
    },
    [game, nextCategory, loadNextQuestion, sounds]
  );

  const handleSkip = useCallback(async () => {
    if (!game || game.isLoading || game.skipsLeft <= 0) return;

    sounds.playSkip();

    // Reset streak for current player
    const updatedPlayers = game.players.map((p, i) =>
      i === game.currentPlayerIndex
        ? { ...p, skips: p.skips + 1, streak: 0 }
        : p
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
  }, [game, loadNextQuestion, sounds]);

  const handleDare = useCallback(async () => {
    if (!game || game.isLoading) return;
    sounds.playCardFlip();
    await loadNextQuestion(game, game.currentPlayerIndex, game.round, "Dare");
  }, [game, loadNextQuestion, sounds]);

  const handleWildcard = useCallback(async () => {
    setShowWildcard(false);
    if (!game) return;

    setGame((prev) => (prev ? { ...prev, isLoading: true } : prev));
    const q = await fetchQuestion("Dare", "savage", game.round, game.players);
    setWildcardQuestion(q);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, [game]);

  const dismissWildcard = useCallback(async () => {
    setWildcardQuestion(null);
    if (!game) return;
    const nextPlayerIdx = (game.currentPlayerIndex + 1) % game.players.length;
    const newRound = nextPlayerIdx === 0 ? game.round + 1 : game.round;
    const newCategory = nextCategory(game.currentCategory);
    await loadNextQuestion(game, nextPlayerIdx, newRound, newCategory);
  }, [game, nextCategory, loadNextQuestion]);

  const keepPlaying = useCallback(async () => {
    if (!game) return;
    setScreen("game");
    const newCategory = nextCategory(game.currentCategory);
    await loadNextQuestion(game, game.currentPlayerIndex, game.round, newCategory);
  }, [game, nextCategory, loadNextQuestion]);

  const dismissRoundSummary = useCallback(
    async (keep: boolean) => {
      setShowRoundSummary(false);
      if (!keep || !game) {
        endGame_();
        return;
      }
      setScreen("game");
      const newCategory = nextCategory(game.currentCategory);
      await loadNextQuestion(game, game.currentPlayerIndex, game.round, newCategory);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, nextCategory, loadNextQuestion]
  );

  const endGame_ = useCallback(() => {
    setScreen("endgame");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const endGame = endGame_;

  const resetGame = useCallback(() => {
    setGame(null);
    setScreen("welcome");
    queueRef.current = [];
    usedQuestionsRef.current = new Set();
    categoryOrderRef.current = shuffleArray(CATEGORIES);
    setShowWildcard(false);
    setWildcardQuestion(null);
    setShowConfetti(false);
    setShowRoundSummary(false);
  }, []);

  return {
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
    keepPlaying,
    endGame,
    resetGame,
    addReaction,
    dismissRoundSummary,
  };
}
