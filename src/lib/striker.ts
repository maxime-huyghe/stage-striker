import { array, assert, number, object, optional, string, type Infer } from "superstruct";
import { derived, get, writable, type Writable } from "svelte/store";
import { GENTLEMAN_STAGES } from "./stages";
import { DEFAULT_RULESET, Phases, Player, type SelectionResult } from "./types";
import { base64Decode } from "./utils";

export const AppState = object({
  phases: Phases,
  bestOf: optional(number()),
  gentlemanStages: array(string()),
  currentStage: optional(string()),
  matchResults: array(Player),
  rpsWinner: optional(Player),
});

export type AppState = Infer<typeof AppState>;

function createStrikerState() {
  const { subscribe, set, update }: Writable<AppState> = writable({
    phases: [...DEFAULT_RULESET],
    bestOf: undefined,
    gentlemanStages: [...GENTLEMAN_STAGES],
    currentStage: undefined,
    matchResults: [],
    rpsWinner: undefined,
  });

  return {
    subscribe,
    setFromBase64: (b64: string) => {
      const json = base64Decode(b64);
      const object: unknown = JSON.parse(json);
      assert(object, AppState);
      set(object);
    },
    pickedBo: (bo: number) => update(s => advanceToNextPhase(s, { bestOf: bo })),
    pickedWinner: (winner: Player) =>
      update(s => advanceToNextPhase(s, { matchResults: [...s.matchResults, winner] })),
    pickedRpsWinner: (winner: Player) => update(s => advanceToNextPhase(s, { rpsWinner: winner })),
    pickedGentlemanStages: (selection: SelectionResult) =>
      update(s => advanceToNextPhase(s, { gentlemanStages: selection.picked })),
    pickedStage: (selection: SelectionResult) =>
      update(s => advanceToNextPhase(s, { currentStage: selection.picked[0] })),
  };
}

export const striker = createStrikerState();

function advanceToNextPhase(
  current: AppState,
  newProperties: Partial<Omit<AppState, "phases">>,
  newPhases?: Phases,
): AppState {
  let { phases } = current;
  if (phases[0].type === "restOfPickBansAndWinnerPicks" && !get(someoneWon)) {
    phases = [{ type: "pickWinner" }, ...phases];
  } else {
    phases = phases.slice(1);
  }
  return {
    ...current,
    ...newProperties,
    phases,
  };
}

function rest<T>(arr: T[]): T[] {
  return arr.slice(1);
}

export const lastWinner = derived(striker, $state =>
  $state.matchResults.length ? $state.matchResults.at(-1) : 1,
);

export const requiredWins = derived(striker, $state =>
  $state.bestOf ? Math.ceil($state.bestOf / 2) : Infinity,
);

export const matchesWonByPlayer = derived(striker, ({ matchResults }) =>
  matchResults.reduce((acc, cur) => ({ ...acc, [cur]: acc[cur] + 1 }), { 1: 0, 2: 0 }),
);

export const someoneWon = derived(
  [matchesWonByPlayer, requiredWins],
  ([wins, required]) => wins[1] >= required || wins[2] >= required,
);
