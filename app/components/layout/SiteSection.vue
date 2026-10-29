<template>
  <section :id="id" :class="[ui.root, TONE_CLASSES[tone]]">
    <UContainer v-reveal :class="[ui.inner, innerClass]">
      <slot />
    </UContainer>
  </section>
</template>

<script setup lang="ts">
type SiteSectionTone = "base" | "muted" | "white";

withDefaults(
  defineProps<{
    id?: string;
    /** Background band from the design: #f2f2f2, #e4e4e4, or white. */
    tone?: SiteSectionTone;
    innerClass?: string;
  }>(),
  {
    tone: "base",
  },
);

const TONE_CLASSES: Record<SiteSectionTone, string> = {
  base: "bg-default",
  muted: "bg-muted",
  white: "bg-white",
};

const ui = {
  root: "scroll-mt-(--ui-header-height) overflow-x-clip",
  inner: "py-16 md:py-24",
};
</script>
