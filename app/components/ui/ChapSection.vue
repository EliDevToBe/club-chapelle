<template>
  <section class="space-y-3 md:space-y-4">
    <div>
      <div v-if="title || hasTitleActions" :class="ui.titleRow">
        <div
          v-if="title"
          :class="isMainSection ? ui.mainTitle : ui.sectionTitle"
        >
          {{ title }}
        </div>
        <div v-if="hasTitleActions" :class="ui.titleActions">
          <slot name="title-actions" />
        </div>
      </div>
      <p v-if="description" :class="ui.description">
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

const slots = useSlots();

const hasTitleActions = computed(() => {
  return Boolean(slots["title-actions"]);
});

const ui = {
  titleRow: "group/title flex items-center gap-2 sm:relative",
  titleActions: "shrink-0 sm:absolute sm:-translate-x-8",
  mainTitle: "text-2xl font-semibold text-highlighted md:text-3xl",
  sectionTitle: "text-lg font-semibold text-highlighted md:text-2xl",
  description: "text-muted text-sm",
};
</script>
