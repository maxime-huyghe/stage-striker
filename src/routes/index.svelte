<script context="module" lang="ts">
  import { DEFAULT_RULESET } from "$lib/types";
  import { appUrl } from "$lib/urls";
  import { base64Encode } from "$lib/utils";
  import type { Load } from "./index";

  export const load: Load = () => {
    return {
      status: 302,
      redirect: appUrl(
        `striker/${DEFAULT_RULESET[0].type}/${base64Encode(JSON.stringify(DEFAULT_RULESET))}`,
      ),
    };
  };
</script>

<!--
  @component
  For now, this just redirects to the default ruleset.
-->
