<script context="module" lang="ts">
  import type { Load } from "./[striker]";
  import BoPicker from "$lib/BoPicker.svelte";
  import StagePicker from "$lib/StagePicker.svelte";
  import { GENTLEMAN_STAGES, NORMAL_STAGES } from "$lib/stages";
  import WinnerPicker from "$lib/WinnerPicker.svelte";
  import { someoneWon, striker, lastWinner, matchesWonByPlayer } from "$lib/striker";

  export const load: Load = ({ params }) => {
    const { striker: stateParam } = params;
    try {
      striker.setFromBase64(stateParam);
      return {};
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
  $: firstPhase = $striker.phases.at(0);
</script>

<svelte:head>
  <title>Stage Striker</title>
</svelte:head>

<main class="flex flex-col items-center">
  {#if firstPhase && !$someoneWon}
    {#if firstPhase.type === "pickBO"}
      <BoPicker />
    {:else if firstPhase.type === "gentleman"}
      <StagePicker
        stages={GENTLEMAN_STAGES}
        gentlemans={true}
        turns={firstPhase.turns}
        on:selection={e => striker.pickedGentlemanStages(e.detail)}
      />
    {:else if firstPhase.type === "rps"}
      <WinnerPicker rpsMode={true} on:winner={e => striker.pickedRpsWinner(e.detail)} />
    {:else if firstPhase.type === "pickWinner"}
      <WinnerPicker
        lastChosenStage={$striker.currentStage}
        on:winner={e => striker.pickedWinner(e.detail)}
      />
    {:else if firstPhase.type === "firstPickBan"}
      <StagePicker
        stages={[...NORMAL_STAGES, ...$striker.gentlemanStages]}
        firstToPick={$striker.rpsWinner}
        turns={firstPhase.turns}
        on:selection={e => striker.pickedStage(e.detail)}
      />
    {:else if firstPhase.type === "restOfPickBansAndWinnerPicks"}
      <StagePicker
        stages={[...NORMAL_STAGES, ...$striker.gentlemanStages]}
        firstToPick={$lastWinner}
        turns={firstPhase.turns}
        on:selection={e => striker.pickedStage(e.detail)}
      />
    {/if}
  {:else}
    <div class="text-2xl">
      Congratulations, player {$matchesWonByPlayer[1] > $matchesWonByPlayer[2] ? 1 : 2}!
    </div>
  {/if}
</main>
