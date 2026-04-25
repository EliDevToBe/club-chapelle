<template>
  <div
    class="flex flex-wrap items-center gap-3"
    :class="description ? 'justify-between' : 'justify-end'"
  >
    <p v-if="description" class="text-sm text-muted">
      {{ description }}
    </p>
    <div class="flex flex-col-reverse sm:flex-row justify-end gap-2">
      <slot name="secondary" />
      <slot name="default" />
      <slot name="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description?: string;
}>();
</script>

<style scoped lang=""></style>
