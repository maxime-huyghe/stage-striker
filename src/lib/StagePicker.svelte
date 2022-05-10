<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Button from "./Button.svelte";
  import StageGrid from "./StageGrid.svelte";
  import type { Player, SelectionResult, Turn } from "./stageSelection";
  import type { StageSelected } from "./stages";

  export let stages: Readonly<string[]>;
  export let gentlemans: boolean = false;
  export let lastWinner: Player;
  export let turns: Turn[];

  if (turns.length === 0) {
    next();
  }

  const dispatch = createEventDispatcher<{ selection: SelectionResult }>();
  function next(): void {
    const selectedStages = [...everySelectedStage.entries()];
    const selection = {
      picked: selectedStages
        .filter(([_, selected]) => selected === "picked")
        .map(([stageId, _]) => stageId),
      banned: selectedStages
        .filter(([_, selected]) => selected === "banned")
        .map(([stageId, _]) => stageId),
    };

    dispatch("selection", selection);
  }

  /** Selected stages for each turn, first element is the current turn. */
  let selectedStagesByTurn: Map<string, StageSelected>[] = [new Map()];

  $: everySelectedStage = selectedStagesByTurn.reduce((x, y) => new Map([...x].concat([...y])));

  let waitingForConfirmation: boolean = false;

  function onStageClick(stageId: string): void {
    if (!turns.length) return;
    waitingForConfirmation = false;
    const turn = turns[0];
    /** Selected stages for this turn */
    const selectedStagesThisTurn = selectedStagesByTurn[0];
    if (
      selectedStagesThisTurn.size < turn.num &&
      !everySelectedStage.has(stageId) &&
      !selectedStagesThisTurn.has(stageId)
    ) {
      selectedStagesThisTurn.set(stageId, turn.ty === "pick" ? "picked" : "banned");
    } else if (selectedStagesThisTurn.has(stageId)) {
      selectedStagesThisTurn.delete(stageId);
    }
    selectedStagesByTurn = selectedStagesByTurn;
    if (selectedStagesThisTurn.size === turn.num) {
      waitingForConfirmation = true;
    }
  }

  /** Called at the end of a turn when a player confirmed their selection. */
  function playerConfirmed(): void {
    waitingForConfirmation = false;
    turns = turns.slice(1);
    selectedStagesByTurn = [new Map(), ...selectedStagesByTurn];
  }

  $: lastLoser = lastWinner === 1 ? 2 : 1;
  $: currentPlayer = turns.length && (turns[0].player === "winner" ? lastWinner : lastLoser);
</script>

<div class="text-2xl pb-2">
  {#if turns.length}
    {#if gentlemans}
      Player {currentPlayer}, pick {turns[0].num} gentleman's stage{turns[0].num > 1 ? "s" : ""}:
    {:else}
      Player {currentPlayer}, {turns[0].ty} {turns[0].num} stage{turns[0].num > 1 ? "s" : ""}:
    {/if}
  {:else}
    Please proceed to the next phase.
  {/if}
</div>

<StageGrid {stages} selectedStages={everySelectedStage} {onStageClick} />

{#if waitingForConfirmation}
  <span class="text-2xl pt-2">
    Player {currentPlayer}, confirm your selection:
  </span>
  <Button on:click={playerConfirmed}>Confirm</Button>
{/if}

{#if !turns.length}
  <Button on:click={next}>Next</Button>
{/if}
