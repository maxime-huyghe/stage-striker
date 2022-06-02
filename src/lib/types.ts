import { dev } from "$app/env";
import type { Unionize } from "./utils";

export type SelectionResult = {
  picked: string[];
  banned: string[];
};

export const GENTLEMAN_TURNS: Readonly<Turn[]> = [
  { type: "pick", num: 1, player: "winner" },
  { type: "pick", num: 1, player: "loser" },
];

export type Player = 1 | 2;

export type Turn = {
  type: "ban" | "pick";
  num: number;
  player: "winner" | "loser";
};

type PhaseOptions = {
  pickBO: unknown;
  gentleman: { turns: Turn[] };
  rps: unknown;
  pickWinner: unknown;
  firstPickBan: { turns: Turn[] };
  restOfPickBansAndWinnerPicks: { turns: Turn[] };
};

export type Phase = Unionize<PhaseOptions>;

export const DEFAULT_RULESET: Readonly<Phase[]> = [
  { type: "pickBO" },
  { type: "gentleman", turns: [...GENTLEMAN_TURNS] },
  { type: "rps" },
  {
    type: "firstPickBan",
    turns: [
      { type: "ban", num: 3, player: "winner" },
      { type: "ban", num: 4, player: "loser" },
      { type: "pick", num: 1, player: "winner" },
    ],
  },
  {
    type: "pickWinner",
  },
  {
    type: "restOfPickBansAndWinnerPicks",
    turns: [
      { type: "ban", num: 3, player: "winner" },
      { type: "pick", num: 1, player: "loser" },
    ],
  },
];

export const DEFAULT_RULESET_PICK_BO = 0;
const DEFAULT_RULESET_GENTLEMAN = 1;
const DEFAULT_RULESET_RPS = 2;
const DEFAULT_RULESET_FIRST_PICK_BAN = 3;
const DEFAULT_RULESET_PICK_WINNER = 4;
const DEFAULT_RULESET_REST_OF_PICK_BANS_AND_WINNER_PICKS = 5;

// export function buildRuleset(normalStages: string[], gentlemanStages: string[]): Phase[] {}

/**
 * Parses a ruleset string into an array of phases.
 * @param ruleset the ruleset string to be parsed
 * @throws {Error} if the ruleset string is invalid
 * @returns a list of phases corresponding to the ruleset
 */
export function parsePhases(ruleset: string): Phase[] {
  const array: unknown[] = JSON.parse(ruleset);
  if (!Array.isArray(array)) {
    throw new Error("malformed ruleset: should be an array");
  }

  for (const idx in array) {
    const phase: unknown = array[idx];
    if (!phase || typeof phase !== "object") {
      throw new Error(
        `malformed ruleset: should be an array of objects, found something else in position ${idx}`,
      );
    }
    if (!isPhaseWithType(phase)) {
      throw new Error(`malformed ruleset: missing name in phase ${idx}`);
    }
    switch (phase.type) {
      case "pickBO":
      case "rps":
      case "pickWinner":
        break;

      case "gentleman":
      case "firstPickBan":
      case "restOfPickBansAndWinnerPicks":
        if (!isPhaseWithTurns(phase)) {
          throw new Error(`malformed ruleset: missing turns in phase ${idx} (${phase.type})`);
        }
        try {
          parseTurns(phase.turns);
        } catch (e) {
          throw new Error(`malformed ruleset: invalid turns in phase ${idx} (${phase.type}): ${e}`);
        }
        break;

      default:
        throw new Error(`malformed ruleset: unknown phase ${phase.type} at position ${idx}`);
    }
  }

  return array;
}

function isPhaseWithType(phase: object): phase is { type: keyof PhaseOptions } {
  return "type" in phase;
}

function isPhaseWithTurns(phase: {
  type: keyof PhaseOptions;
}): phase is { type: keyof PhaseOptions; turns: unknown } {
  return "turns" in phase;
}

function parseTurns(turns: unknown): Turn[] {
  if (!Array.isArray(turns)) {
    throw new Error("malformed turns: should be an array");
  }

  for (const idx in turns) {
    const turn: unknown = turns[idx];
    if (!turn || typeof turn !== "object") {
      throw new Error(
        `malformed turns: should be an array of objects, found something else in position ${idx}`,
      );
    }
    if (!isTurnWithType(turn)) {
      throw new Error(`malformed turn: at ${idx}`);
    }
  }

  return turns as Turn[];
}

function isTurnWithType(turn: any): turn is Turn {
  return (
    "type" in turn &&
    (turn.type === "ban" || turn.type === "pick") &&
    "num" in turn &&
    typeof turn.num === "number" &&
    "player" in turn &&
    (turn.player === "winner" || turn.player === "loser")
  );
}
