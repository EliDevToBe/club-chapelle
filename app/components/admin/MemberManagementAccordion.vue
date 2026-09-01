<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
  >
    <template #content="{ item }">
      <MemberManagement v-if="item.value === 'members'" />
    </template>
  </ChapAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import MemberManagement from "~/components/admin/MemberManagement.vue";
import ChapAccordion from "~/components/ui/ChapAccordion.vue";

const accordionItems = [
  {
    label: "Gestion des membres",
    value: "members",
    icon: "i-ph-users-three-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
</script>
