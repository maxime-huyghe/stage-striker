import type { Turn } from "./stageSelection";

export type Phase =
  | { name: "pickBO" }
  | {
      name: "gentleman";
      turns: Turn[];
    }
  | { name: "rps" }
  | {
      name: "pickWinner";
    }
  | {
      name: "firstPickBan";
      turns: Turn[];
    }
  | {
      name: "restOfPickBansAndWinnerPicks";
      turns: Turn[];
    };
