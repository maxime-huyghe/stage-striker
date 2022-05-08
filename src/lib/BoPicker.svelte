<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";

  const dispatch = createEventDispatcher<{ choice: 3 | 5 }>();
</script>

<div class="text-2xl">Set type?</div>

<Button on:click={() => dispatch("choice", 3)}>BO3</Button>
<Button on:click={() => dispatch("choice", 5)}>BO5</Button>
