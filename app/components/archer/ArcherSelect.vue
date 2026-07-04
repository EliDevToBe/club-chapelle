<template>
  <ChapInputMenu
    ref="chapInputMenuRef"
    v-model="model"
    v-model:search-term="searchTerm"
    :is-loading="isLoading"
    :items="items"
    :placeholder="placeholder"
    create-item-label="Créer l'archer·ère"
    create-item
    ignore-filter
    @create="onCreate"
    @update:open="onOpen"
  />
</template>

<script setup lang="ts">
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { isAbortError } from "~/composables/useAbortController";
import { useArcher } from "~/composables/useArcher";
import { useChapToast } from "~/composables/useChapToasts";
import type { ArcherDto } from "~~/shared/archer/archer.dto";
import { ARCHER_LIST_PAGE_SIZE } from "~~/shared/archer/archer-list.dto";
import type { ChapInputMenuItem } from "../ui/ChapInputMenu.vue";
import ChapInputMenu from "../ui/ChapInputMenu.vue";

defineProps<{
  createItem?: boolean;
  placeholder?: string;
}>();

const model = defineModel<string | undefined>();

const { listPage, create } = useArcher();
const { addToastError } = useChapToast();

const chapInputMenuRef = useTemplateRef<{ viewportRef?: HTMLElement | null }>(
  "chapInputMenuRef",
);

const searchTerm = ref("");
const debouncedSearchTerm = refDebounced(searchTerm, 200);
const items = ref<ChapInputMenuItem[]>([]);
const total = ref(0);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const abortController = ref<AbortController | null>(null);
const isOpen = ref(false);

const hasMore = computed(() => {
  return items.value.length < total.value;
});

const toMenuItems = (archers: ArcherDto[]): ChapInputMenuItem[] => {
  return archers.map((archer) => {
    return {
      label: archer.public_name,
      value: archer.id,
    };
  });
};

const abortInFlight = (): void => {
  abortController.value?.abort();
  abortController.value = null;
};

const loadPage = async (options: { reset: boolean }): Promise<void> => {
  if (options.reset) {
    abortInFlight();
    items.value = [];
    total.value = 0;
    isLoading.value = true;
  } else {
    if (!hasMore.value || isLoading.value || isLoadingMore.value) {
      return;
    }
    isLoadingMore.value = true;
  }

  const controller = new AbortController();
  abortController.value = controller;

  try {
    const offset = options.reset ? 0 : items.value.length;
    const response = await listPage(
      {
        limit: ARCHER_LIST_PAGE_SIZE,
        offset,
        search: debouncedSearchTerm.value.trim() || undefined,
      },
      controller.signal,
    );

    total.value = response.total;
    const mapped = toMenuItems(response.archers);

    if (options.reset) {
      items.value = mapped;
    } else {
      items.value = [...items.value, ...mapped];
    }
  } catch (error) {
    if (isAbortError(error)) {
      return;
    }
    addToastError({
      description:
        "Une erreur est survenue lors de la récupération des archer·ère·s",
    });
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadNextPage = (): void => {
  void loadPage({ reset: false });
};

const onOpen = (open: boolean): void => {
  isOpen.value = open;
  if (open && items.value.length === 0) {
    void loadPage({ reset: true });
  }
};

const onCreate = async (): Promise<void> => {
  const publicName = searchTerm.value.trim();
  if (!publicName) {
    return;
  }

  try {
    isLoading.value = true;

    const archer = await create({ public_name: publicName });
    items.value = [
      { label: archer.public_name, value: archer.id },
      ...items.value,
    ];
    total.value += 1;
    model.value = archer.id;
  } catch {
    addToastError({
      description: "Impossible de créer l'archer·ère",
    });
  } finally {
    isLoading.value = false;
  }
};

watch(debouncedSearchTerm, () => {
  if (!isOpen.value) {
    return;
  }
  void loadPage({ reset: true });
});

onMounted(() => {
  useInfiniteScroll(
    () => {
      return chapInputMenuRef.value?.viewportRef ?? null;
    },
    loadNextPage,
    {
      distance: 200,
      canLoadMore: () => {
        return !isLoading.value && !isLoadingMore.value && hasMore.value;
      },
    },
  );
});

onUnmounted(() => {
  abortInFlight();
});
</script>

<style scoped lang=""></style>
