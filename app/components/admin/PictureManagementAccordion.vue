<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
  >
    <template #content="{ item }">
      <PictureManagement v-if="item.value === 'photo-handling'" />
    </template>
  </ChapAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import PictureManagement from "~/components/admin/PictureManagement.vue";
import ChapAccordion from "~/components/ui/ChapAccordion.vue";

const accordionItems = [
  {
    label: "Gestion des photos",
    value: "photo-handling",
    icon: "i-ph-images-square-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
</script>
