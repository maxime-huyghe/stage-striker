<script lang="ts">
  import Button from "./Button.svelte";
  import { striker } from "./striker";
</script>

<div class="text-2xl">Set type?</div>

<Button on:click={() => striker.pickedBo(3)}>BO3</Button>
<Button on:click={() => striker.pickedBo(5)}>BO5</Button>
