<template>
  <UButton
    :to="to"
    :target="target"
    :icon="icon"
    :variant="variant"
    size="lg"
    :label="label"
    :class="ui.button"
  />
</template>

<script setup lang="ts">
type Variant = "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";

const props = withDefaults(
  defineProps<{
    to?: string;
    target?: string;
    icon?: string;
    variant?: Variant;
    size?: string;
    label: string;
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
