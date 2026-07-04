<template>
  <UAccordion
    ref="accordionRef"
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
import { useElementHover } from "@vueuse/core";
import {
  LIGHT_BACKGROUND_COLOR,
  LIGHT_HOVER_BORDER_COLOR,
} from "~/components/ui/style";

const props = defineProps<{
  items: AccordionItem[];
}>();

const accordionRef = ref<HTMLElement>();
const isOpen = ref<boolean>(false);

const isHovered = useElementHover(accordionRef);

const ui = computed(() => ({
  accordion: [
    "rounded-lg border border-default p-4",
    isOpen.value ? `${LIGHT_BACKGROUND_COLOR}` : "",
    isHovered.value ? `${LIGHT_HOVER_BORDER_COLOR}` : "",
  ],
}));

const optionsUi = {
  trigger: "cursor-pointer",
  trailingIcon: "group-data-[state=open]:rotate-90",
};
</script>
