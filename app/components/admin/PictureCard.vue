<template>
  <div
    :class="[
      ui.itemButton,
      selected ? ui.selectedClasses : ui.unselectedClasses,
    ]"
    @click.prevent.stop="emit('toggleSelection')"
  >
    <div class="flex justify-center group relative">
      <span
        class="hidden group-hover:block absolute top-2 left-2 text-sm text-primary-600"
        >{{ `${image.mimetype.split("/").at(-1)?.toUpperCase()}` }}</span
      >
      <span
        v-if="image.size"
        :class="`hidden group-hover:block absolute ${selected ? 'top-7 left-2' : 'top-2 right-2'} text-sm text-primary-600`"
        >{{ `${formatBytes(image.size)}` }}</span
      >

      <img
        :src="image.preview_url"
        :alt="image.label"
        width="240"
        height="160"
        class="h-40 w-40 object-contain select-none"
        loading="lazy"
        decoding="async"
      />

      <UIcon
        v-if="selected"
        name="i-ph-check-circle-duotone"
        class="size-5 text-primary absolute top-2 right-2"
      />
    </div>

    <div @click.stop class="flex items-center gap-1 justify-between px-3 py-2">
      <ChapEditableLabel
        :is-editing="isEditing"
        :editing-label="image.label"
        :label="normalizeText(image.label, 24)"
        size="sm"
        @update:label="
          (newLabel) => {
            console.log('newLabel1', newLabel);
            emit('rename', newLabel);
          }
        "
        v-model:current-label="localEditingLabel"
      />

      <UButton
        size="sm"
        variant="ghost"
        color="secondary"
        :icon="isEditing ? 'i-ph-check-bold' : 'i-lucide-pencil-line'"
        :loading="isRenaming"
        :disabled="isMutating"
        @click="
          isEditing
            ? emit('rename', localEditingLabel)
            : emit('toggleNameEditing')
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChapEditableLabel from "~/components/ui/ChapEditableLabel.vue";
import type { WebsiteGalleryImageDto } from "~~/shared/website/website-config.dto";

defineProps<{
  image: WebsiteGalleryImageDto;
  selected: boolean;
  isEditing: boolean;
  isRenaming: boolean;
  isMutating: boolean;
}>();

const emit = defineEmits<{
  toggleSelection: [];
  toggleNameEditing: [];
  rename: [newLabel: string];
}>();

const localEditingLabel = ref<string>("");

const formatBytes = (bytes: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "unit",
    unit: "megabyte",
    unitDisplay: "narrow",
    maximumFractionDigits: 1,
  }).format(bytes / 1_000_000);
};

const normalizeText = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength
    ? `${text.substring(0, maxLength - 3)}...`
    : text;
};

const ui = {
  itemButton:
    "group cursor-pointer overflow-hidden rounded-lg border text-left transition",
  selectedClasses: "border-primary ring-1 ring-primary bg-primary/5",
  unselectedClasses:
    "border-default hover:border-primary/50 hover:bg-muted/20 focus:border-primary/50",
};
</script>

<style scoped lang=""></style>
