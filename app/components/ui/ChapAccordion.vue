<template>
  <UAccordion
    :ui="optionsUi"
    :items="items"
    :class="ui.accordion"
    trailing-icon="i-ph-caret-right-duotone"
  >
    <template #content="{ item }">
      <slot name="content" :item="item" />
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const props = withDefaults(
  defineProps<{
    items: AccordionItem[];
  }>(),
  {
    items: () => [],
  },
);

const ui = {
  accordion: "rounded-lg border border-default p-4",
};
const optionsUi = {
  trigger: "cursor-pointer",
  trailingIcon: "group-data-[state=open]:rotate-90",
};
</script>
