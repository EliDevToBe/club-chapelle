<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
  >
    <template #content="{ item }">
      <SiteSettingsManagement v-if="item.value === 'site-settings'" />
    </template>
  </ChapAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import SiteSettingsManagement from "~/components/admin/SiteSettingsManagement.vue";
import ChapAccordion from "~/components/ui/ChapAccordion.vue";

const accordionItems = [
  {
    label: "Paramètres du site",
    value: "site-settings",
    icon: "i-ph-gear-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
</script>
