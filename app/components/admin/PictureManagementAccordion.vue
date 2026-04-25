<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
    :class="selectedItem ? 'bg-secondary/5' : ''"
  >
    <template #content="{ item }">
      <div class="flex gap-2 items-center mb-1 px-2">
        <span class="text-center text-sm"
          >Stockage&nbsp;(5Go)&nbsp;:&nbsp;</span
        >
        <UProgress status v-model="usedStorageInfo" :max="maxStorage" />
      </div>
      <PictureManagement v-if="item.value === 'photo-handling'" />
    </template>
  </ChapAccordion>
</template>

<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import PictureManagement from "~/components/admin/PictureManagement.vue";
import ChapAccordion from "~/components/ui/ChapAccordion.vue";
import { usePictureManagement } from "~/composables/usePictureManagement";

const { getStorageInfo } = usePictureManagement();

const maxStorage = ref(1024 * 1024 * 1024 * 5); // 5GB

const accordionItems = [
  {
    label: "Gestion des photos",
    value: "photo-handling",
    icon: "i-ph-images-square-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
const usedStorageInfo = ref(0);

onMounted(async () => {
  const storageInfo = await getStorageInfo();
  usedStorageInfo.value = storageInfo.used;
  maxStorage.value = storageInfo.allowance;
});
</script>
