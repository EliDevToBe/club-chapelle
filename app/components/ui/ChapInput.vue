<template>
  <UInput v-model="model" :placeholder="placeholder" :icon="icon" :class>
    <template #trailing v-if="clearable && !!model">
      <UButton
        icon="i-ph-x-bold"
        variant="link"
        size="sm"
        @click="model = undefined"
        color="secondary"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
defineProps<{
  placeholder?: string;
  icon?: string;
  class?: string;
  clearable?: boolean;
}>();

const model = defineModel<string>();
</script>

<style scoped lang=""></style>
