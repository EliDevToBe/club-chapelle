<template>
  <div :class="ui.root" aria-hidden="true">
    <span :class="[ui.watermark, controlClass, '']">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  controlClass?: string;
}>();

const ui = {
  root: "pointer-events-none absolute inset-0 -z-1 flex items-center justify-center",
  watermark: [
    "select-none font-bold tabular-nums leading-none tracking-tighter",
    "text-highlighted/[0.07] dark:text-highlighted/[0.11]",
    "text-[min(18rem,55vw)] sm:text-[min(22rem,50vw)]",
  ],
};
</script>
