<script lang="ts">
  export let hidden: boolean = false;
</script>

<button class="text-2xl mt-2 px-2 py-1 rounded-md text-white bg-red-500" on:click class:hidden>
  <slot />
</button>
