<template>
  <ChapAccordion
    :items="accordionItems"
    v-model="selectedItem"
    class="transition-colors duration-150"
  >
    <template #content="{ item }">
      <div class="flex gap-2 items-center mb-1 px-2">
        <span class="text-center text-sm"
          >Stockage&nbsp;({{ maxUnitString }})&nbsp;:&nbsp;</span
        >
        <UProgress
          :color="progressColor"
          status
          v-model="usedStorageInfo"
          :max="maxStorage"
        />
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

const maxStorage = ref(1000 * 1000 * 1000 * 5); // 5GB
const maxUnitString = ref();

const accordionItems = [
  {
    label: "Gestion des photos",
    value: "photo-handling",
    icon: "i-ph-images-square-duotone",
  },
] satisfies AccordionItem[];

const selectedItem = ref<string | null>(null);
const usedStorageInfo = ref(0);

const formatBytes = (bytes: number): string => {
  type Unit = "megabyte" | "gigabyte";
  const unit: Unit = "megabyte";
  const units: Record<Unit, number> = {
    megabyte: 1_000_000,
    gigabyte: 1_000_000_000,
  };

  return new Intl.NumberFormat("fr-FR", {
    style: "unit",
    unit: unit,
    unitDisplay: "narrow",
    maximumFractionDigits: 1,
  }).format(bytes / units[unit]);
};

const progressColor = computed(() => {
  const percentage = usedStorageInfo.value / maxStorage.value;
  if (percentage < 0.8) {
    return "success";
  }
  if (percentage < 0.9) {
    return "warning";
  }
  return "error";
});

onMounted(async () => {
  const storageInfo = await getStorageInfo();
  usedStorageInfo.value = storageInfo.used;
  maxStorage.value = storageInfo.allowance;

  maxUnitString.value = formatBytes(storageInfo.allowance);
});
</script>
