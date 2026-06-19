export type Vibe = "mild" | "spicy" | "savage";
export type Category =
  | "Truth"
  | "Dare"
  | "Would You Rather"
  | "Hot Take"
  | "Never Have I Ever"
  | "Confess";
export type Screen = "welcome" | "setup" | "game" | "roundend" | "endgame";

export type ReactionType = "funny" | "shocking" | "spicy" | "bold";

export interface Reaction {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: Reaction[] = [
  { type: "funny", emoji: "😂", label: "Funny" },
  { type: "shocking", emoji: "😮", label: "Shocking" },
  { type: "spicy", emoji: "🔥", label: "Spicy" },
  { type: "bold", emoji: "💀", label: "Bold" },
];

export interface Player {
  name: string;
  skips: number;
  dares: number;
  answered: number;
  streak: number; // consecutive answered
  maxStreak: number;
  reactions: Record<ReactionType, number>; // reactions received
}

export interface QuestionEntry {
  question: string;
  category: Category;
  playerIndex: number;
  round: number;
  reactions: Record<ReactionType, number>;
}

export interface GameState {
  players: Player[];
  vibe: Vibe;
  currentPlayerIndex: number;
  round: number;
  totalQuestions: number;
  skipsLeft: number;
  heatLevel: number; // 0-100
  meltdownMode: boolean;
  meltdownRoundsLeft: number;
  lastWildcard: number;
  screen: Screen;
  currentQuestion: string | null;
  currentCategory: Category;
  isLoading: boolean;
  usedQuestions: Set<string>;
  questionHistory: QuestionEntry[];
  showReactions: boolean;
  lastQuestionIndex: number; // index into questionHistory for reactions
}

export const CATEGORIES: Category[] = [
  "Truth",
  "Dare",
  "Would You Rather",
  "Hot Take",
  "Never Have I Ever",
  "Confess",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Truth: "#3b82f6",
  Dare: "#ef4444",
  "Would You Rather": "#8b5cf6",
  "Hot Take": "#f59e0b",
  "Never Have I Ever": "#10b981",
  Confess: "#ec4899",
};

export const CATEGORY_GRADIENTS: Record<Category, [string, string]> = {
  Truth: ["#1e3a5f", "#3b82f6"],
  Dare: ["#5f1e1e", "#ef4444"],
  "Would You Rather": ["#3b1e5f", "#8b5cf6"],
  "Hot Take": ["#5f3b1e", "#f59e0b"],
  "Never Have I Ever": ["#1e5f2e", "#10b981"],
  Confess: ["#5f1e3b", "#ec4899"],
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Truth: "🔵",
  Dare: "🔴",
  "Would You Rather": "🟣",
  "Hot Take": "🟠",
  "Never Have I Ever": "🟢",
  Confess: "🌸",
};
