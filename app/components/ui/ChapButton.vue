<template>
  <UButton
    :disabled="disabled"
    :to="to"
    :target="target"
    :icon="icon"
    :variant="variant"
    :size="size"
    :label="label"
    :color="color"
    :class="[ui.base, additionalClass ?? '']"
  />
</template>

<script setup lang="ts">
type Variant = "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    to?: string;
    target?: string;
    icon?: string;
    variant?: Variant;
    size?: Size;
    label: string;
    additionalClass?: string;
    color?: "primary" | "secondary";
  }>(),
  {
    variant: "solid",
    size: "lg",
    color: "primary",
  },
);

const ui = {
  base: "min-h-10",
};
</script>
