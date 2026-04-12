<template>
  <section class="space-y-3 md:space-y-4">
    <template v-if="isMainSection && title">
      <h1 :class="ui.mainTitle">
        {{ title }}
      </h1>
    </template>

    <template v-else-if="title">
      <h2 :class="ui.sectionTitle">
        {{ title }}
      </h2>
    </template>

    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    isMainSection?: boolean;
  }>(),
  {
    isMainSection: false,
  },
);

const ui = {
  root: "space-y-3 md:space-y-4",
  mainTitle: "text-2xl font-semibold text-highlighted md:text-3xl",
  sectionTitle: "text-lg font-semibold text-highlighted md:text-xl",
};
</script>
