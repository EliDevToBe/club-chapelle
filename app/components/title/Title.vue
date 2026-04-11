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
const ui = {
  secondaryLabel: "text-lg",
  mainLabel: "text-4xl",

  rootWrapper: ["flex", "flex-col md:flex-row md:gap-1"],
  textWrapper: "flex gap-1 items-baseline",
};
</script>

<style scoped lang=""></style>
