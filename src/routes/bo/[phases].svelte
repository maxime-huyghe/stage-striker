<script context="module" lang="ts">
  import type { Load } from "./[phases]";
  import {
    parsePhasesAndCheckPhase,
    type Phase,
    type PhasesStartingWith,
    type Player,
    type SelectionResult,
  } from "$lib/types";
  import BoPicker from "$lib/BoPicker.svelte";
  import StagePicker from "$lib/StagePicker.svelte";
  import { GENTLEMAN_STAGES, NORMAL_STAGES } from "$lib/stages";
  import WinnerPicker from "$lib/WinnerPicker.svelte";

  const PHASE_NAME = "pickBO";

  export const load: Load = ({ params }) => {
    const phasesString = params.phases;
    try {
      return {
        props: {
          phases: parsePhasesAndCheckPhase(PHASE_NAME, phasesString),
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
  export let phases: PhasesStartingWith<typeof PHASE_NAME>;

  let bestOf: number;
  let gentlemanStages: string[] = [];
  let lastChosenStage: string;
  let matchResults: Player[] = [];
  let rpsWinner: Player;

  $: lastWinner = (matchResults.length ? matchResults.at(-1) : 1) as Player;
  $: requiredWins = Math.ceil(bestOf / 2);
  $: player1Wins = matchResults.filter((p) => p === 1).length;
  $: player2Wins = matchResults.filter((p) => p === 2).length;
  $: someoneWon = player1Wins >= requiredWins || player2Wins >= requiredWins;

  function advanceToNextPhase(): void {
    if (phases[0].type === "restOfPickBansAndWinnerPicks" && !someoneWon) {
      phases = [{ type: "pickWinner" }, ...phases];
    } else {
      console.debug("normal advance");
      phases = phases.length ? phases.slice(1) : [];
    }
  }

  function pickedBo(e: CustomEvent<number>) {
    bestOf = e.detail;
    advanceToNextPhase();
  }

  function pickedWinner(e: CustomEvent<Player>): void {
    matchResults = [...matchResults, e.detail];
    advanceToNextPhase();
  }

  function pickedRpsWinner(e: CustomEvent<Player>): void {
    rpsWinner = e.detail;
    advanceToNextPhase();
  }

  function pickedGentlemanStages(e: CustomEvent<SelectionResult>): void {
    gentlemanStages = e.detail.picked;
    advanceToNextPhase();
  }

  function pickedStage(e: CustomEvent<SelectionResult>): void {
    lastChosenStage = e.detail.picked[0];
    advanceToNextPhase();
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
      <WinnerPicker {lastChosenStage} on:winner={pickedWinner} />
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
