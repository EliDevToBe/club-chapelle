<template>
  <section class="space-y-3 md:space-y-4">
    <div>
      <div
        v-if="!!title"
        :class="isMainSection ? ui.mainTitle : ui.sectionTitle"
      >
        {{ title }}
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

const ui = {
  mainTitle: "text-2xl font-semibold text-highlighted md:text-3xl",
  sectionTitle: "text-lg font-semibold text-highlighted md:text-2xl",
  description: "text-muted text-sm",
};
</script>
