<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
    :class="selectedItem ? 'bg-secondary/5' : ''"
  >
    <template #content="{ item }">
      <FeatureManagement v-if="item.value === 'feature-flags'" />
    </template>
  </ChapAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import FeatureManagement from "~/components/admin/FeatureManagement.vue";
import ChapAccordion from "~/components/ui/ChapAccordion.vue";

const accordionItems = [
  {
    label: "Feature flags",
    value: "feature-flags",
    icon: "i-ph-flag-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
</script>
