<script context="module" lang="ts">
  import type { Load } from "./[strikerState]";
  import {
    parsePhasesAndCheckPhase,
    PhaseVariant,
    type Phase,
    Player,
    type SelectionResult,
  } from "$lib/types";
  import BoPicker from "$lib/BoPicker.svelte";
  import StagePicker from "$lib/StagePicker.svelte";
  import { GENTLEMAN_STAGES, NORMAL_STAGES } from "$lib/stages";
  import WinnerPicker from "$lib/WinnerPicker.svelte";
  import { goto } from "$app/navigation";
  import { appUrl } from "$lib/urls";
  import { base64Decode, base64Encode } from "$lib/utils";
  import { array, assert, number } from "superstruct";

  const BO_PARAM = "bo";
  const GENTLEMAN_STAGES_PARAM = "gentleman";
  const CURRENT_STAGE_PARAM = "stage";
  const MATCHRESULTS_PARAM = "winner";
  const RPS_PARAM = "rps";

  export const load: Load = ({ params, url }) => {
    const { currentPhase, strikerState } = params;
    if (!PhaseVariant.is(currentPhase)) {
      return {
        status: 404,
        error: new Error(`unknown phase ${currentPhase}`),
      };
    }
    const sp = url.searchParams;
    try {
      const bestOf = Number(sp.get(BO_PARAM));
      assert(bestOf, number());
      const matchResults = sp.getAll(MATCHRESULTS_PARAM).map((x) => Number(x));
      assert(matchResults, array(Player));
      const rpsWinner = Number(sp.get(RPS_PARAM));
      assert(rpsWinner, number());
      return {
        props: {
          phases: parsePhasesAndCheckPhase(currentPhase, base64Decode(strikerState)),
          bestOf,
          matchResults,
          rpsWinner,
          gentlemanStages: sp.getAll(GENTLEMAN_STAGES_PARAM),
          currentStage: sp.get(CURRENT_STAGE_PARAM),
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: 404,
        error: error as Error,
      };
    }
  };
</script>

<script lang="ts">
  export let phases: Phase[];
  export let bestOf: number;
  export let gentlemanStages: string[];
  export let currentStage: string;
  export let matchResults: Player[];
  export let rpsWinner: Player;

  $: lastWinner = (matchResults.length ? matchResults.at(-1) : 1) as Player;
  $: requiredWins = bestOf ? Math.ceil(bestOf / 2) : Infinity;
  $: player1Wins = matchResults.filter((p) => p === 1).length;
  $: player2Wins = matchResults.filter((p) => p === 2).length;
  $: someoneWon = player1Wins >= requiredWins || player2Wins >= requiredWins;

  function currentStateForParams() {
    return {
      bestOf,
      gentlemanStages,
      currentStage,
      matchResults,
      rpsWinner,
    };
  }

  function advanceToNextPhase(newParams: {
    bestOf?: number;
    gentlemanStages?: string[];
    currentStage?: string;
    matchResults?: Player[];
    rpsWinner?: Player;
  }): void {
    const { bestOf, gentlemanStages, currentStage, matchResults, rpsWinner } = {
      ...currentStateForParams(),
      ...newParams,
    };
    console.log(currentStateForParams(), newParams);
    if (phases[0].type === "restOfPickBansAndWinnerPicks" && !someoneWon) {
      phases = [{ type: "pickWinner" }, ...phases];
    } else {
      console.debug("normal advance");
      phases = phases.length ? phases.slice(1) : [];
    }
    if (phases.length) {
      const url = appUrl(`striker/${phases[0].type}/${base64Encode(JSON.stringify(phases))}`);
      const sp = new URLSearchParams();
      bestOf && sp.set(BO_PARAM, bestOf.toString());
      gentlemanStages &&
        gentlemanStages.forEach((stage) => sp.append(GENTLEMAN_STAGES_PARAM, stage));
      currentStage && sp.set(CURRENT_STAGE_PARAM, currentStage);
      matchResults &&
        matchResults.forEach((player) => sp.append(MATCHRESULTS_PARAM, player.toString()));
      rpsWinner && sp.set(RPS_PARAM, rpsWinner.toString());
      console.log("going to", `${url}?${sp.toString()}`);
      goto(`${url}?${sp.toString()}`);
    }
  }

  function pickedBo(e: CustomEvent<number>) {
    console.log("detail", e.detail);
    advanceToNextPhase({
      bestOf: e.detail,
    });
  }

  function pickedWinner(e: CustomEvent<Player>): void {
    advanceToNextPhase({
      matchResults: [...matchResults, e.detail],
    });
  }

  function pickedRpsWinner(e: CustomEvent<Player>): void {
    advanceToNextPhase({
      rpsWinner: e.detail,
    });
  }

  function pickedGentlemanStages(e: CustomEvent<SelectionResult>): void {
    advanceToNextPhase({
      gentlemanStages: e.detail.picked,
    });
  }

  function pickedStage(e: CustomEvent<SelectionResult>): void {
    advanceToNextPhase({
      currentStage: e.detail.picked[0],
    });
  }
</script>

<svelte:head>
  <title>Stage Striker</title>
</svelte:head>

<main class="flex flex-col items-center">
  {#if phases && !someoneWon}
    {#if phases[0].type === "pickBO"}
      <BoPicker on:choice={pickedBo} />
    {:else if phases[0].type === "gentleman"}
      <StagePicker
        stages={GENTLEMAN_STAGES}
        gentlemans={true}
        lastWinner={1}
        turns={phases[0].turns}
        on:selection={pickedGentlemanStages}
      />
    {:else if phases[0].type === "rps"}
      <WinnerPicker rpsMode={true} on:winner={pickedRpsWinner} />
    {:else if phases[0].type === "pickWinner"}
      <WinnerPicker lastChosenStage={currentStage} on:winner={pickedWinner} />
    {:else if phases[0].type === "firstPickBan"}
      <StagePicker
        stages={[...NORMAL_STAGES, ...gentlemanStages]}
        lastWinner={rpsWinner}
        turns={phases[0].turns}
        on:selection={pickedStage}
      />
    {:else if phases[0].type === "restOfPickBansAndWinnerPicks"}
      <StagePicker
        stages={[...NORMAL_STAGES, ...gentlemanStages]}
        {lastWinner}
        turns={phases[0].turns}
        on:selection={pickedStage}
      />
    {/if}
  {:else}
    <div class="text-2xl">
      Congratulations, player {player1Wins > player2Wins ? 1 : 2}!
    </div>
  {/if}
</main>
