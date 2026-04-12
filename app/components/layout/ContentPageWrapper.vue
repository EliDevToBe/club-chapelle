<template>
  <div :class="ui.root">
    <slot />
  </div>
</template>

<script setup lang="ts">
const ui = {
  root: "mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-10 md:space-y-14",
};
</script>
