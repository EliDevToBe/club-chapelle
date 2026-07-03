<template>
  <UAccordion
    :ui="optionsUi"
    :items="items"
    :class="ui.accordion"
    trailing-icon="i-ph-caret-right-duotone"
    @update:model-value="(value) => (isOpen = !!value)"
  >
    <template #content="{ item }">
      <slot name="content" :item="item" />
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import { LIGHT_BACKGROUND_COLOR } from "~/components/ui/colors";

const props = defineProps<{
  items: AccordionItem[];
}>();

const isOpen = ref<boolean>(false);

const ui = computed(() => ({
  accordion: [
    "rounded-lg border border-default p-4",
    isOpen.value ? `${LIGHT_BACKGROUND_COLOR}` : "",
  ],
}));

const optionsUi = {
  trigger: "cursor-pointer",
  trailingIcon: "group-data-[state=open]:rotate-90",
};
</script>
