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
        @on-confirm="deleteSelection"
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
        :loading="isUploading"
        :disabled="isMutating"
        @click="triggerUploadPicker"
      />

      <input
        ref="uploadInputRef"
        type="file"
        class="hidden"
        multiple
        accept="image/*"
        @change="onFilesPicked"
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
        :key="image.path"
        type="button"
        :class="[
          ui.itemButton,
          isSelected(image.url) ? ui.selectedClasses : ui.unselectedClasses,
        ]"
        @click="toggleSelection(image.url)"
      >
        <div class="flex justify-center group relative">
          <span
            class="hidden group-hover:block absolute top-2 left-2 text-sm text-primary-600"
            >{{ `${image.mimetype.split("/").at(-1)?.toUpperCase()}` }}</span
          >

          <img
            :src="image.preview_url"
            :alt="image.label"
            width="240"
            height="160"
            class="h-40 w-40 object-contain"
            loading="lazy"
            decoding="async"
          />

          <UIcon
            v-if="isSelected(image.url)"
            name="i-ph-check-circle-duotone"
            class="size-5 text-primary absolute top-2 right-2"
          />
        </div>

        <div
          @click.stop
          class="flex items-center gap-1 justify-between px-3 py-2"
        >
          <ChapEditableLabel
            :is-editing="editingPath === image.path"
            :editing-label="image.label"
            :label="normalizeText(image.label, 24)"
            size="sm"
            @update:label="
              (event) => {
                editingPath = null;
                renameImage(image.path, event);
              }
            "
          />

          <UButton
            size="sm"
            variant="ghost"
            color="secondary"
            icon="i-lucide-pencil-line"
            :loading="renamingPath === image.path"
            :disabled="isMutating"
            @click="toggleNameEditing(image.path)"
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
import ChapConfirmModal from "~/components/ui/ChapConfirmModal.vue";
import ChapEditableLabel from "~/components/ui/ChapEditableLabel.vue";
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
  uploadPictures,
  renamePicture,
  deletePictures,
} = usePictureManagement();

const isSaving = ref(false);
const isUploading = ref(false);
const renamingPath = ref<string | null>(null);
const editingPath = ref<string | null>(null);
const selectedUrls = ref<string[]>([]);
const uploadInputRef = ref<HTMLInputElement | null>(null);

const galleryImages = ref<WebsiteGalleryImageDto[]>([]);
watch(
  () => galleryData.value?.images,
  (images) => {
    galleryImages.value = images ?? [];
  },
  {
    immediate: true,
  },
);

const isLoadingInitial = computed(() => {
  return isLoadingGallery.value || isLoadingCarouselConfig.value;
});

const isMutating = computed(() => {
  return isSaving.value || isUploading.value || renamingPath.value !== null;
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
        mimetype: image.mimetype,
      };
    });
});

const refreshAll = async (): Promise<void> => {
  editingPath.value = null;
  await Promise.all([refreshGallery(), refreshCarouselConfig()]);
};

const triggerUploadPicker = (): void => {
  uploadInputRef.value?.click();
};

const onFilesPicked = async (event: Event): Promise<void> => {
  event.preventDefault();

  const input = event.target as HTMLInputElement | null;
  const files = input?.files ? Array.from(input.files) : [];
  if (files.length === 0) {
    return;
  }

  isUploading.value = true;
  try {
    const response = await uploadPictures(files);
    const failedCount = response.results.filter((item) => !item.success).length;
    const successCount = response.results.length - failedCount;

    if (successCount > 0) {
      addToastSuccess({
        title: "Images envoyées",
        description: `${successCount} image(s) envoyée(s) avec succès.`,
      });
    }

    if (failedCount > 0) {
      addToastError({
        title: "Envoi partiel",
        description: `${failedCount} image(s) n'ont pas pu être envoyées.`,
      });
    }
  } catch (_error) {
    addToastError({
      title: "Échec de l'envoi",
      description: "L'upload des images a échoué.",
    });
  } finally {
    isUploading.value = false;
    if (input) {
      input.value = "";
    }
  }
};

const toggleNameEditing = (path: string): void => {
  if (editingPath.value === path) {
    editingPath.value = null;
    return;
  }

  editingPath.value = path;
};

const renameImage = async (path: string, newName: string): Promise<void> => {
  const originalName = galleryImages.value.find(
    (image) => image.path === path,
  )?.label;
  if (originalName === newName) {
    return;
  }

  renamingPath.value = path;
  selectedUrls.value = selectedUrls.value.filter((url) => url !== path);

  try {
    await renamePicture(path, newName);

    /**
     * Only for reactivity update
     */
    galleryImages.value = galleryImages.value.map((image) => {
      if (image.path === path) {
        const uppercasedNewName = newName
          .toLowerCase()
          .replace(/^\w/, (char) => char.toUpperCase());
        const lowercasedNewName = newName.toLowerCase();

        const updatedImage = {
          ...image,
          label: uppercasedNewName,
          path: image.path.replace(
            image.label.toLowerCase(),
            lowercasedNewName,
          ),
          url: image.url.replace(image.label.toLowerCase(), lowercasedNewName),
        };

        return updatedImage;
      }

      return image;
    });

    addToastSuccess({
      title: "Image renommée",
      description: "Le nouveau nom a bien été appliqué.",
    });
  } catch (_error) {
    addToastError({
      title: "Échec du renommage",
      description: "Le fichier n'a pas pu être renommé.",
    });
  } finally {
    renamingPath.value = null;
  }
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

const deleteSelection = async (): Promise<void> => {
  isSaving.value = true;

  const paths = selectedUrls.value.map((url) => {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.split("/").at(-1) ?? decodedUrl;
  });

  try {
    const { removedFromCarouselCount } = await deletePictures(paths);

    addToastSuccess({
      title: `${removedFromCarouselCount} photos supprimée(s)`,
    });
  } catch (error) {
    console.error(error);
    addToastError({
      title: "Échec de la suppression",
      description: "Les photos n'ont pas pu être supprimées.",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped lang=""></style>
