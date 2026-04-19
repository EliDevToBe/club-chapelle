<template>
  <div :class="ui.rootWrapper">
    <div :class="ui.textWrapper">
      <span :class="ui.secondaryLabel">Les</span>
      <span :class="ui.mainLabel">Archers</span>
    </div>

    <div :class="ui.textWrapper">
      <span :class="ui.secondaryLabel">de la</span>
      <span :class="ui.mainLabel">Chapelle</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    density?: "default" | "compact";
  }>(),
  { density: "default" },
);

const ui = computed(() =>
  props.density === "compact"
    ? {
        secondaryLabel: "text-xs text-secondary-500  md:text-sm",
        mainLabel: "text-xl md:text-2xl text-primary-500",
        rootWrapper: ["flex", "flex-col sm:flex-row sm:gap-1 pr-4.5"],
        textWrapper: "flex gap-1 items-baseline",
      }
    : {
        secondaryLabel: "text-lg text-secondary-500",
        mainLabel: "text-4xl text-primary-500",
        rootWrapper: ["flex", "flex-col md:flex-row md:gap-1"],
        textWrapper: "flex gap-1 items-baseline",
      },
);
</script>

<style scoped lang=""></style>
