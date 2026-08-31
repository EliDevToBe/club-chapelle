<template>
  <UTextarea
    v-if="isEditing"
    v-model="intro"
    :rows="2"
    :class="ui.introInput"
    :disabled="isSaving"
    :placeholder="introPlaceholder"
    autoresize
    :ui="{
      base: 'text-muted text-base!',
    }"
  />
  <p v-else-if="viewIntro">
    {{ viewIntro }}
  </p>

  <ul ref="listEl" :class="ui.listWrapper">
    <template
      v-for="(item, index) in displayedItems"
      :key="itemKey(item, index)"
    >
      <slot name="item" :item="item" :index="index" />
    </template>
  </ul>

  <div v-if="isEditing" :class="ui.addRow">
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-ph-plus-bold"
      :label="addLabel"
      :disabled="isSaving"
      @click="emit('add')"
    />
  </div>

  <slot name="footer" />
</template>

<script setup lang="ts" generic="TItem extends { id: string }">
import { useSortable } from "@vueuse/integrations/useSortable";

const props = withDefaults(
  defineProps<{
    isEditing: boolean;
    isSaving?: boolean;
    viewIntro: string;
    viewItems: TItem[];
    introPlaceholder?: string;
    addLabel: string;
    dragHandleSelector?: string;
  }>(),
  {
    isSaving: false,
    introPlaceholder: "",
    dragHandleSelector: ".section-drag-handle",
  },
);

const emit = defineEmits<{
  add: [];
}>();

const intro = defineModel<string>("intro", { required: true });
const items = defineModel<TItem[]>("items", { required: true });

const listEl = useTemplateRef<HTMLElement>("listEl");
let stopSortable: (() => void) | null = null;

const displayedItems = computed((): TItem[] => {
  if (props.isEditing) {
    return items.value;
  }

  return props.viewItems;
});

const itemKey = (item: TItem, index: number): string => {
  if (item.id.length > 0) {
    return item.id;
  }

  return `item-${index}`;
};

watch(
  () => {
    return props.isEditing;
  },
  async (editing) => {
    if (!import.meta.client) {
      return;
    }

    if (!editing) {
      stopSortable?.();
      stopSortable = null;
      return;
    }

    await nextTick();
    const sortable = useSortable(listEl, items, {
      handle: props.dragHandleSelector,
      animation: 200,
      filter: `input, textarea, button:not(${props.dragHandleSelector})`,
      preventOnFilter: false,
    });
    stopSortable = sortable.stop;
  },
);

onBeforeUnmount(() => {
  stopSortable?.();
  stopSortable = null;
});

const ui = {
  listWrapper: "flex flex-col gap-2",
  introInput: "w-full bg-transparent text-muted text-base md:text-lg",
  addRow: "flex justify-center",
};
</script>
