<template>
  <span>
    <NuxtLink :class="baseClass" :to="to" :target="target">
      <span> {{ label }} </span>
      <UIcon v-if="icon" class="text-muted w-3" :name="icon" />
    </NuxtLink>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to: string;
    label: string;
    icon?: string;
    color?: "primary" | "secondary";
    target?: string;
  }>(),
  {
    color: "primary",
  },
);

const ui = {
  base: "inline-flex gap-0.5 font-bold hover:underline hover:underline-offset-4",
  color: "text-$color-500 hover:text-$color active:text-$color-600",
};

const baseClass = computed(() => {
  const colorClass = ui.color.replaceAll(/\$color/g, props.color);

  return [ui.base, colorClass];
});
</script>

<style scoped lang=""></style>
