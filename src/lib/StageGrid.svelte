<script lang="ts">
  import Stage, { type StageAppearance } from "./Stage.svelte";
  import { LEGAL_STAGES_DATA, type StageSelected } from "./stages";

  export let stages: Readonly<string[]>;
  export let selectedStages: Map<string, StageSelected>;
  export let onStageClick: (stageId: string) => void = () => {};

  function stageClick(stageId: string): void {
    onStageClick(stageId);
  }
</script>

<div class="grid grid-cols-2 lg:grid-cols-3">
  {#each stages as stageId}
    <Stage
      stage={LEGAL_STAGES_DATA[stageId]}
      onClick={() => stageClick(stageId)}
      selected={selectedStages.get(stageId) ?? "no"}
    />
  {/each}
</div>
