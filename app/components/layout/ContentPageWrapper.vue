<template>
  <div :class="ui.root">
    <slot />
  </div>
</template>

<script setup lang="ts">
const ui = {
  root: [
    "flex flex-col w-full",
    "max-w-5xl",
    "mx-auto px-4 py-8 md:py-12",
    "gap-9 md:gap-12",
    "text-muted",
  ],
};
</script>
