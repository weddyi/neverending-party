export type Vibe = "mild" | "spicy" | "savage";
export type Category =
  | "Truth"
  | "Dare"
  | "Would You Rather"
  | "Hot Take"
  | "Never Have I Ever"
  | "Confess";
export type Screen = "welcome" | "setup" | "game" | "roundend" | "endgame";

export interface Player {
  name: string;
  skips: number;
  dares: number;
  answered: number;
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
}
