<template>
  <UInputMenu
    ref="inputMenuRef"
    v-model="model"
    v-model:search-term="searchTerm"
    :items="items"
    value-key="value"
    :placeholder="placeholder || 'Rechercher…'"
    class="w-full"
    :icon="icon || 'i-ph-magnifying-glass-duotone'"
    :loading="isLoading"
    :ignore-filter="ignoreFilter"
    :create-item="createItem"
    @create="emit('create')"
    @update:open="emit('update:open', $event)"
    trailing-icon="i-ph-caret-right-duotone"
    selected-icon="i-iconoir-arrow-archery"
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
export type ChapInputMenuItem = {
  label: string;
  value: string;
};

defineProps<{
  items: ChapInputMenuItem[];
  isLoading: boolean;
  placeholder?: string;
  icon?: string;
  createItemLabel?: string;
  createItemClass?: string;
  createItem?: "always" | boolean;
  ignoreFilter?: boolean;
}>();

const emit = defineEmits<{
  create: [];
  "update:open": [open: boolean];
}>();

const model = defineModel<string | undefined>();
const searchTerm = defineModel<string>("searchTerm", { default: "" });

const inputMenuRef = useTemplateRef<{ viewportRef?: HTMLElement | null }>(
  "inputMenuRef",
);

defineExpose({
  get viewportRef() {
    return inputMenuRef.value?.viewportRef ?? null;
  },
});
</script>

<style scoped lang=""></style>
