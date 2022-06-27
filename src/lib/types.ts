import {
  array,
  assert,
  enums,
  literal,
  min,
  nonempty,
  number,
  object,
  union,
  type Describe,
  type Infer,
} from "superstruct";

export type SelectionResult = {
  picked: string[];
  banned: string[];
};

export const GENTLEMAN_TURNS: Readonly<Turn[]> = [
  { type: "pick", num: 1, player: "winner" },
  { type: "pick", num: 1, player: "loser" },
];

export const Player = enums([1, 2]);

export type Player = Infer<typeof Player>;

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

const Turn = object({
  type: union([literal("ban"), literal("pick")]),
  num: min(number(), 1),
  player: union([literal("winner"), literal("loser")]),
});

export type Turn = Infer<typeof Turn>;

export const Phase = union([
  object({ type: literal("pickBO") }),
  object({ type: literal("gentleman"), turns: array(Turn) }),
  object({ type: literal("rps") }),
  object({ type: literal("pickWinner") }),
  object({ type: literal("firstPickBan"), turns: array(Turn) }),
  object({ type: literal("restOfPickBansAndWinnerPicks"), turns: array(Turn) }),
]);

export type Phase = Infer<typeof Phase>;

export const Phases = nonempty(array(Phase));

export type Phases = Infer<typeof Phases>;

export type PhaseVariant = Phase["type"];

// Easier to do it this way.
export const PhaseVariant: Describe<PhaseVariant> = enums([
  "pickBO",
  "gentleman",
  "rps",
  "pickWinner",
  "firstPickBan",
  "restOfPickBansAndWinnerPicks",
]);

/**
 * Parses a ruleset string into an array of phases.
 * @param phaseVariant the phase variant to check for
 * @param ruleset the ruleset string to be parsed
 * @throws {Error} if the ruleset string is invalid or the variant is wrong
 * @returns a list of phases corresponding to the ruleset
 */
export function parsePhasesAndCheckPhase(phaseVariant: PhaseVariant, ruleset: string): Phase[] {
  const phases: unknown = JSON.parse(ruleset);
  assert(phases, Phases);
  const [firstPhase] = phases;
  if (firstPhase.type !== phaseVariant) {
    throw new Error(
      `malformed ruleset: missing ${phaseVariant} phase in position 0 (got ${firstPhase.type})`,
    );
  }
  return phases;
}
