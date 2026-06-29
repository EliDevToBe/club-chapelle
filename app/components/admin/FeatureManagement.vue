<template>
  <div :class="ui.rootWrapper">
    <p v-if="registryEntries.length === 0" class="text-sm text-muted">
      Aucun feature flag défini. Ajoutez des entrées dans le registre partagé
      (<code class="text-xs">shared/website/feature-flags.schema.ts</code>).
    </p>

    <ul v-else :class="ui.flagsWrapper">
      <li
        v-for="[key, definition] in registryEntries"
        :key="key"
        :class="ui.flagItem"
      >
        <div :class="ui.flagContentWrapper">
          <p :class="ui.flagLabel">{{ definition.label }}</p>
          <p v-if="definition.description" :class="ui.flagDescription">
            {{ definition.description }}
          </p>
          <p :class="ui.flagKey">{{ key }}</p>
        </div>

        <USwitch
          :model-value="flags[key as FeatureFlagKey]"
          :disabled="isSaving || pending"
          @update:model-value="onToggle(key as FeatureFlagKey, $event)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useChapToast } from "~/composables/useChapToasts";
import { useFeatureFlags } from "~/composables/useFeatureFlags";
import {
  FEATURE_FLAG_REGISTRY,
  type FeatureFlagKey,
} from "~~/shared/website/feature-flags.schema";

const ui = {
  rootWrapper: "flex flex-col gap-3 px-2 pb-2",
  flagsWrapper: "flex flex-col gap-3",
  flagItem:
    "flex items-center justify-between gap-4 rounded-lg border border-default px-3 py-2",
  flagContentWrapper: "min-w-0 flex-1 gap-1 flex flex-col",

  flagLabel: "text-sm font-medium",
  flagDescription: "text-xs text-muted",
  flagKey: "text-xs text-dimmed font-mono",
};

const { addToastError } = useChapToast();
const { flags, updateFlag, isSaving, pending } = useFeatureFlags();

const registryEntries = computed(() => {
  return Object.entries(FEATURE_FLAG_REGISTRY);
});

const onToggle = async (key: FeatureFlagKey, value: boolean): Promise<void> => {
  try {
    await updateFlag(key, value);
  } catch (error) {
    console.error(error);
    addToastError({
      title: "Échec de mise à jour",
      description: "Le feature flag n'a pas pu être enregistré.",
    });
  }
};
</script>
