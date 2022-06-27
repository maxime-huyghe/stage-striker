<script context="module" lang="ts">
  import { GENTLEMAN_STAGES } from "$lib/stages";

  import type { AppState } from "$lib/striker";

  import { DEFAULT_RULESET } from "$lib/types";
  import { appUrl } from "$lib/urls";
  import { base64Encode } from "$lib/utils";
  import type { Load } from "./index";

  export const load: Load = () => {
    const defaultState: AppState = {
      phases: [...DEFAULT_RULESET],
      gentlemanStages: [...GENTLEMAN_STAGES],
      matchResults: [],
    };
    return {
      status: 302,
      redirect: appUrl(`striker/${base64Encode(JSON.stringify(defaultState))}`),
    };
  };
</script>

<!--
  @component
  For now, this just redirects to the default ruleset.
-->
