<template>
  <ChapAccordionContentWrapper>
    <ChapAccordionContentAction
      description="Sélectionnez les images à afficher dans le carrousel public."
    >
      <template #primary>
        <UButton
          icon="i-ph-check-circle-duotone"
          color="primary"
          label="Confirmer la sélection"
          :loading="isSaving"
          :disabled="isSaving || galleryImages.length === 0"
          @click="saveSelection"
        />
      </template>

      <ChapConfirmModal
        :title="`Suppression des photos (${selectedImages.length})`"
        description="Êtes-vous sûr de vouloir supprimer ces photos ?"
        @on-confirm="console.log('suppression')"
      >
        <UButton
          v-if="selectedImages.length > 0"
          icon="i-ph-trash-duotone"
          color="error"
          variant="subtle"
          :loading="isSaving"
          :disabled="isSaving || galleryImages.length === 0"
        />
      </ChapConfirmModal>

      <UButton
        icon="i-ph-upload-duotone"
        color="secondary"
        label="Upload"
        :loading="isSaving"
        :disabled="isSaving || galleryImages.length === 0"
        @click="console.log('upload')"
      />

      <template #secondary>
        <UButton
          icon="i-ph-arrows-clockwise-duotone"
          variant="outline"
          color="secondary"
          label="Rafraîchir"
          :loading="isLoadingInitial"
          :disabled="isLoadingInitial"
          @click="refreshAll"
        />
      </template>
    </ChapAccordionContentAction>

    <Banner
      v-if="galleryFetchError || carouselConfigFetchError"
      message="Impossible de charger les images ou la configuration distante."
      color="error"
      icon="i-ph-warning-duotone"
    />

    <div v-if="isLoadingInitial" :class="ui.pictureWrapper">
      <USkeleton
        v-for="index in 6"
        :key="index"
        class="h-40 w-full rounded-lg"
      />
    </div>

    <div v-else-if="galleryImages.length === 0" :class="ui.noResultWrapper">
      Aucun visuel trouvé dans le dossier Sirv
      <code class="text-primary-500">/chapelle</code>.
    </div>

    <div v-else :class="ui.pictureWrapper">
      <button
        v-for="image in galleryImages"
        :key="image.url"
        type="button"
        :class="[
          ui.itemButton,
          isSelected(image.url) ? ui.selectedClasses : ui.unselectedClasses,
        ]"
        @click="toggleSelection(image.url)"
      >
        <div class="flex justify-center">
          <img
            :src="image.preview_url"
            :alt="image.label"
            width="240"
            height="160"
            class="h-40 w-40 object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="flex items-center justify-between px-3 py-2">
          <span class="text-sm font-medium text-highlighted">{{
            normalizeText(image.label, 23)
          }}</span>
          <UIcon
            v-if="isSelected(image.url)"
            name="i-ph-check-circle-duotone"
            class="size-5 text-primary"
          />
        </div>
      </button>
    </div>

    <p class="text-sm text-muted">
      {{ selectedUrls.length }} image(s) sélectionnée(s).
    </p>
  </ChapAccordionContentWrapper>
</template>

<script setup lang="ts">
import Banner from "~/components/banner/Banner.vue";
import ChapAccordionContentAction from "~/components/ui/ChapAccordionContentAction.vue";
import ChapAccordionContentWrapper from "~/components/ui/ChapAccordionContentWrapper.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import ChapConfirmModal from "~/components/ui/ChapConfirmModal.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { usePictureManagement } from "~/composables/usePictureManagement";
import { useWebsiteConfig } from "~/composables/useWebsiteConfig";
import type {
  HomepageCarouselItemDto,
  WebsiteGalleryImageDto,
} from "~~/shared/website/website-config.dto";

const ui = {
  pictureWrapper: "grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  noResultWrapper:
    "rounded-lg border border-dashed border-default px-4 py-6 text-sm text-muted",
  itemButton:
    "group cursor-pointer overflow-hidden rounded-lg border text-left transition",

  selectedClasses: "border-primary ring-1 ring-primary bg-primary/5",
  unselectedClasses:
    "border-default hover:border-primary/50 hover:bg-muted/20 focus:border-primary/50",
};

const { addToastError, addToastSuccess } = useChapToast();
const { saveConfig } = useWebsiteConfig();
const {
  galleryData,
  isLoadingGallery,
  galleryFetchError,
  refreshGallery,
  configCarouselData,
  isLoadingCarouselConfig,
  carouselConfigFetchError,
  refreshCarouselConfig,
} = usePictureManagement();

const isSaving = ref(false);
const selectedUrls = ref<string[]>([]);

const galleryImages = computed<WebsiteGalleryImageDto[]>(() => {
  return galleryData.value?.images ?? [];
});

const isLoadingInitial = computed(() => {
  return isLoadingGallery.value || isLoadingCarouselConfig.value;
});

watch(
  () => configCarouselData.value?.settings.data,
  (items) => {
    if (!items) {
      selectedUrls.value = [];
      return;
    }

    selectedUrls.value = items.map((item) => item.url);
  },
  {
    immediate: true,
  },
);

const normalizeText = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength
    ? `${text.substring(0, maxLength - 3)}...`
    : text;
};

const isSelected = (url: string): boolean => {
  return selectedUrls.value.includes(url);
};

const toggleSelection = (url: string): void => {
  if (isSelected(url)) {
    selectedUrls.value = selectedUrls.value.filter((entry) => entry !== url);
    return;
  }

  selectedUrls.value = [...selectedUrls.value, url];
};

const selectedImages = computed<HomepageCarouselItemDto[]>(() => {
  const selectedSet = new Set(selectedUrls.value);
  return galleryImages.value
    .filter((image) => selectedSet.has(image.url))
    .map((image) => {
      return {
        label: image.label,
        url: image.url,
        preview_url: image.preview_url,
        width: image.width,
        height: image.height,
        mtime: image.mtime,
      };
    });
});

const refreshAll = async (): Promise<void> => {
  await Promise.all([refreshGallery(), refreshCarouselConfig()]);
};

const saveSelection = async (): Promise<void> => {
  isSaving.value = true;

  try {
    await saveConfig("homepageCarousel", selectedImages.value);

    addToastSuccess({
      title: "Configuration enregistrée",
      description: "Le carrousel du site utilisera cette sélection.",
    });
  } catch (_error) {
    addToastError({
      title: "Échec de sauvegarde",
      description: "La configuration du carrousel n'a pas pu être enregistrée.",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped lang=""></style>
