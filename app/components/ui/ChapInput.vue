<template>
  <UInput v-model="model" :placeholder="placeholder" :icon="icon" :class>
    <template #trailing v-if="clearable && !!model">
      <div
        class="cursor-pointer text-secondary hover:text-secondary-500 flex justify-center items-center shrink-0"
        @click="model = undefined"
      >
        <UIcon name="i-ph-x-bold" class="size-4" />
      </div>
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
