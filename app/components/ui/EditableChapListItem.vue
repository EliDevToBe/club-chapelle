<template>
  <ChapListItem>
    <template v-if="isEditing" #leading>
      <button
        type="button"
        :class="[dragHandleClass, ui.dragHandle]"
        :aria-label="reorderAria"
        :disabled="disabled"
      >
        <UIcon name="i-ph-dots-six-vertical-bold" />
      </button>
    </template>

    <slot />

    <template v-if="isEditing" #trailing>
      <slot name="trailing" />
      <UButton
        type="button"
        color="error"
        variant="ghost"
        size="sm"
        icon="i-ph-trash-duotone"
        :aria-label="removeAria"
        :disabled="disabled"
        @click="emit('remove')"
      />
    </template>
  </ChapListItem>
</template>

<script setup lang="ts">
import ChapListItem from "~/components/ui/ChapListItem.vue";

withDefaults(
  defineProps<{
    isEditing: boolean;
    disabled?: boolean;
    reorderAria: string;
    removeAria: string;
    dragHandleClass?: string;
  }>(),
  {
    disabled: false,
    dragHandleClass: "section-drag-handle",
  },
);

const emit = defineEmits<{
  remove: [];
}>();

const ui = {
  dragHandle:
    "mt-1 inline-flex cursor-grab items-center text-muted active:cursor-grabbing disabled:cursor-not-allowed",
};
</script>
