<template>
  <UButton
    :to="to"
    :target="target"
    :icon="icon"
    :variant="variant"
    :size="size"
    :label="label"
    :class="overrideClass ?? ui.button"
  />
</template>

<script setup lang="ts">
type Variant = "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const props = withDefaults(
  defineProps<{
    to?: string;
    target?: string;
    icon?: string;
    variant?: Variant;
    size?: Size;
    label: string;
    overrideClass?: string;
  }>(),
  {
    variant: "solid",
    size: "lg",
  },
);

const ui = {
  button: ["min-h-11"],
};
</script>
