<template>
  <span :class="ui.root" :role="label ? 'img' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'" />
</template>

<script setup lang="ts">
defineProps<{
  /** Accessible name; omit when the glyph is decorative or the parent is already labelled. */
  label?: string;
}>();

/** Masking the static SVG keeps it cacheable while `currentColor` drives the fill. */
const ui = {
  root: [
    "inline-block shrink-0 aspect-[36/33.2] bg-current",
    "mask-[url(/brand/archer-glyph.svg)] mask-contain mask-center mask-no-repeat",
  ],
};
</script>
