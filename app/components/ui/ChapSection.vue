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
        <div
          v-else-if="title"
          :class="isMainSection ? ui.mainTitle : ui.sectionTitle"
        >
          {{ title }}
        </div>

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
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    isMainSection?: boolean;
  }>(),
  {
    isMainSection: false,
  },
);

const ui = {
  titleRow: "group/title flex items-center gap-2 sm:relative",
  titleSlot: "min-w-0",
  titleActions: "shrink-0 sm:absolute sm:-translate-x-8",
  mainTitle: "text-2xl font-semibold text-highlighted md:text-3xl",
  sectionTitle: "text-lg font-semibold text-highlighted md:text-2xl",
  description: "text-muted text-sm",
};
</script>
