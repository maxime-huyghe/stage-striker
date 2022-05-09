<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import BoPicker from "$lib/BoPicker.svelte";
  import StagePicker from "$lib/StagePicker.svelte";

  import { GENTLEMAN_STAGES, NORMAL_STAGES } from "$lib/stages";
  import {
    GENTLEMAN_TURNS,
    type Player,
    type SelectionResult,
    type Turn,
  } from "$lib/stageSelection";
  import WinnerPicker from "$lib/WinnerPicker.svelte";

  type Phase =
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

  let phases: Phase[] = [
    { name: "pickBO" },
    { name: "gentleman", turns: [...GENTLEMAN_TURNS] },
    { name: "rps" },
    {
      name: "firstPickBan",
      turns: [
        { ty: "ban", num: 3, player: "winner" },
        { ty: "ban", num: 4, player: "loser" },
        { ty: "pick", num: 1, player: "winner" },
      ],
    },
    {
      name: "pickWinner",
    },
    {
      name: "restOfPickBansAndWinnerPicks",
      turns: [
        { ty: "ban", num: 3, player: "winner" },
        { ty: "pick", num: 1, player: "loser" },
      ],
    },
  ];
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
    if (phases[0].name === "restOfPickBansAndWinnerPicks" && !someoneWon) {
      phases = [{ name: "pickWinner" }, ...phases];
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

<main class="flex flex-col items-center">
  {#if phases && !someoneWon}
    {#if phases[0].name === "pickBO"}
      <BoPicker on:choice={pickedBo} />
    {:else if phases[0].name === "gentleman"}
      <StagePicker
        stages={GENTLEMAN_STAGES}
        gentlemans={true}
        lastWinner={1}
        turns={phases[0].turns}
        on:selection={pickedGentlemanStages}
      />
    {:else if phases[0].name === "rps"}
      <WinnerPicker rpsMode={true} on:winner={pickedRpsWinner} />
    {:else if phases[0].name === "pickWinner"}
      <WinnerPicker {lastChosenStage} on:winner={pickedWinner} />
    {:else if phases[0].name === "firstPickBan"}
      <StagePicker
        stages={[...NORMAL_STAGES, ...gentlemanStages]}
        lastWinner={rpsWinner}
        turns={phases[0].turns}
        on:selection={pickedStage}
      />
    {:else if phases[0].name === "restOfPickBansAndWinnerPicks"}
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
