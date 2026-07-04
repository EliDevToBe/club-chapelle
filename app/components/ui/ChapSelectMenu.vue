<template>
  <USelectMenu
    v-model="model"
    :items="items"
    value-key="value"
    :search-input="searchInput"
    :placeholder="placeholder"
    class="min-w-40"
    selected-icon="i-iconoir-arrow-archery"
    :ui="{
      itemTrailingIcon: 'text-primary-500',
      itemLeadingIcon: 'text-secondary-500',
    }"
  >
    <template #trailing>
      <UIcon
        class="group-data-[state=open]:rotate-90 transition-transform duration-200 text-muted size-4"
        name="i-ph-caret-right-duotone"
      />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
export type ChapSelectMenuItem = {
  label: string;
  value: string | null;
  icon?: string;
};

defineProps<{
  items: ChapSelectMenuItem[];
  placeholder?: string;
  searchInput?: boolean;
}>();

const model = defineModel<string | null | undefined>();
</script>

<style scoped lang=""></style>
