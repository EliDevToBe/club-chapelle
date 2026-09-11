<template>
  <div :class="ui.banner">
    <UIcon name="i-ph-info-duotone" :class="ui.icon" />
    <p :class="ui.message">
      Validation d'email en cours pour
      <span class="font-medium text-highlighted"> {{ pendingEmail }} </span>.
      Saisissez le code dans la section dédiée.
    </p>
    <UButton
      label="Y aller"
      variant="link"
      color="info"
      icon="i-ph-arrow-right-duotone"
      size="sm"
      :class="ui.action"
      @click="
        () => {
          scrollToSettingsSection(SETTINGS_SECTION_IDS.email);
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import {
  SETTINGS_SECTION_IDS,
  scrollToSettingsSection,
} from "~/constants/settings-sections";

defineProps<{
  pendingEmail: string;
}>();

const ui = {
  banner: [
    "rounded-md border border-info/40 bg-info/10 px-3 py-2 text-sm text-info",
    "flex flex-col gap-2 sm:flex-row sm:items-center",
  ],
  icon: "size-4 shrink-0",
  message: "flex-1",
  action: "self-start sm:self-center shrink-0 px-0",
};
</script>
