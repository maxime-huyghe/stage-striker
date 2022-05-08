<script context="module" lang="ts">
  export type StageAppearance = "normal" | "dimmed" | "picked" | "banned";
</script>

<script lang="ts">
  import type { StageData, StageSelected } from "./stages";

  export let stage: StageData;
  export let selected: StageSelected;
  export let onClick: () => void = () => {};
</script>

<div class="m-2 relative" on:click={onClick}>
  <div
    class="absolute z-10 w-full h-full"
    class:bg-black={selected !== "banned"}
    class:bg-red-500={selected === "banned"}
    class:bg-opacity-0={selected === "picked"}
    class:bg-opacity-50={selected === "no"}
    class:bg-opacity-70={selected === "banned"}
  />
  <img src={stage.image} alt={stage.name} class="w-52" />
  <span
    class="absolute z-20 bottom-0 left-0 w-full h-8 text-center text-lg bg-opacity-80 text-white bg-slate-800"
  >
    {stage.name}
  </span>
</div>
