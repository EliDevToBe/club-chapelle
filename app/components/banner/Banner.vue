<template>
  <div :class="[ui.base, colorClass]">
    <UIcon v-if="icon" :name="icon" class="size-4" />
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message: string;
  color: "error" | "success" | "info" | "primary" | "secondary" | "warning";
  icon?: string;
}>();

const ui = {
  base: "rounded-md border px-3 py-2 text-sm flex items-center gap-2",
  color: "border-$color/40 bg-$color/10 text-$color",
};

const colorClass = computed(() => {
  return ui.color.replaceAll(/\$color/g, props.color);
});
</script>

<style scoped lang=""></style>
