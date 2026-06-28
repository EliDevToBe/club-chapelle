<template>
  <UInputMenu
    v-model="model"
    :items="items"
    value-key="value"
    :placeholder="placeholder || 'Rechercher…'"
    class="w-full"
    :icon="icon || 'i-ph-magnifying-glass-duotone'"
    :loading="isLoading"
    :create-item="createItem ? createItem : false"
  >
    <template v-if="createItemLabel" #create-item-label="{ item }">
      <div class="flex items-center gap-1 cursor-pointer">
        <UIcon name="i-ph-plus-bold" class="size-4 text-primary-500" />
        <span>
          {{ createItemLabel }}
          <span :class="createItemClass || 'text-primary-500 font-semibold'">
            {{ item }}
          </span>
        </span>
      </div>
    </template>
  </UInputMenu>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { label: string; value: string }[];
  isLoading: boolean;
  placeholder?: string;
  icon?: string;
  createItemLabel?: string;
  createItemClass?: string;
  createItem?: "always";
}>();

const model = defineModel<string | undefined>();
</script>

<style scoped lang=""></style>
