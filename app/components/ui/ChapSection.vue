<template>
  <section class="space-y-3 md:space-y-4">
    <div>
      <div
        v-if="title || $slots.title || $slots['title-actions']"
        :class="ui.titleRow"
      >
        <div v-if="$slots.title" :class="ui.titleSlot">
          <slot name="title" />
        </div>
        <component
          :is="headingTag"
          v-else-if="title"
          :class="isPageTitle || isMainSection ? ui.mainTitle : ui.sectionTitle"
        >
          {{ title }}
        </component>

        <div v-if="$slots['title-actions']" :class="ui.titleActions">
          <slot name="title-actions" />
        </div>
      </div>
      <div v-if="$slots.description">
        <slot name="description" />
      </div>
      <p v-else-if="description" :class="ui.description">
        {{ description }}
      </p>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
import { MAIN_SECTION_TITLE, SECTION_TITLE } from "./style";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    isMainSection?: boolean;
    /** The page's own title: renders the main style as the page `h1`. */
    isPageTitle?: boolean;
  }>(),
  {
    isMainSection: false,
    isPageTitle: false,
  },
);

const headingTag = computed(() => {
  if (props.isPageTitle) {
    return "h1";
  }

  return props.isMainSection ? "h2" : "h3";
});

const ui = {
  titleRow: "group/title flex items-center gap-2 sm:relative",
  titleSlot: "min-w-0",
  titleActions: "shrink-0 sm:absolute sm:-translate-x-8",
  mainTitle: MAIN_SECTION_TITLE,
  sectionTitle: SECTION_TITLE,
  description: "text-muted text-sm",
};
</script>
