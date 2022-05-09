<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import Stage from "./Stage.svelte";
  import { LEGAL_STAGES_DATA } from "./stages";

  export let rpsMode: boolean = false;
  export let lastChosenStage: string | null = null;

  const dispatch = createEventDispatcher<{ winner: 1 | 2 }>();
</script>

{#if rpsMode}
  <div class="text-2xl">Play rock-paper-scissors.</div>
  <div class="text-2xl">Who won?</div>
{:else}
  <div class="text-2xl">Who won this match?</div>
  {#if lastChosenStage}
    <Stage stage={LEGAL_STAGES_DATA[lastChosenStage]} selected="picked" />
  {/if}
{/if}

<div class="flex flex-row gap-4">
<Button on:click={() => dispatch("winner", 1)}>&lt;| Player 1</Button>
<Button on:click={() => dispatch("winner", 2)}>Player 2 |&gt;</Button>
</div>
