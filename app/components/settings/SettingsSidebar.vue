<template>
  <nav aria-label="Sections des paramètres" :class="ui.root">
    <ul class="flex flex-col gap-1">
      <li v-for="item in SETTINGS_NAV_ITEMS" :key="item.sectionId">
        <button
          type="button"
          :class="[ui.link, item.danger ? ui.linkDanger : '']"
          @click="
            () => {
              scrollToSettingsSection(item.sectionId);
            }
          "
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import {
  SETTINGS_NAV_ITEMS,
  scrollToSettingsSection,
} from "~/constants/settings-sections";

const ui = {
  root: "hidden md:block md:sticky md:top-24",
  link: [
    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted cursor-pointer",
    "hover:bg-neutral-800/30 hover:text-neutral-300 transition-colors",
  ],
  linkDanger: "text-error! hover:text-error! hover:bg-error/10!",
};
</script>
