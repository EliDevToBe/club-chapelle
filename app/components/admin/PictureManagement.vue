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
        v-for="index in pageSize"
        :key="index"
        class="h-40 w-full rounded-lg"
      />
    </div>

    <div v-else-if="galleryImages.length === 0" :class="ui.noResultWrapper">
      Aucun visuel trouvé dans le dossier Sirv
      <code class="text-primary-500">/chapelle</code>.
    </div>

    <div v-else :class="ui.pictureWrapper">
      <PictureCard
        v-for="image in visibleGalleryImages"
        :key="image.path"
        :image="image"
        :selected="isSelected(image.url)"
        :is-editing="editingPath === image.path"
        :is-renaming="renamingPath === image.path"
        :is-mutating="isMutating"
        @toggle-selection="toggleSelection(image.url)"
        @toggle-name-editing="toggleNameEditing(image.path)"
        @rename="
          (newLabel) => {
            editingPath = null;
            renameImage(image.path, newLabel);
          }
        "
      />
    </div>

    <div v-if="showPagination" class="flex justify-center pt-2">
      <UPagination
        size="sm"
        variant="ghost"
        active-variant="outline"
        v-model:page="currentPage"
        :total="galleryImages.length"
        :items-per-page="pageSize"
        show-edges
        color="primary"
      />
    </div>

    <p class="text-sm text-muted">
      {{ selectedUrls.length }} image(s) sélectionnée(s).
    </p>
  </ChapAccordionContentWrapper>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import PictureCard from "~/components/admin/PictureCard.vue";
import Banner from "~/components/banner/Banner.vue";
import ChapAccordionContentAction from "~/components/ui/ChapAccordionContentAction.vue";
import ChapAccordionContentWrapper from "~/components/ui/ChapAccordionContentWrapper.vue";
import ChapConfirmModal from "~/components/ui/ChapConfirmModal.vue";
import { useChapToast } from "~/composables/useChapToasts";
import { usePictureManagement } from "~/composables/usePictureManagement";
import { useWebsiteConfig } from "~/composables/useWebsiteConfig";
import {
  clampGalleryPage,
  getGalleryPageSize,
  getGalleryPageSlice,
} from "~~/shared/website/gallery-pagination";
import type {
  HomepageCarouselItemDto,
  WebsiteGalleryImageDto,
} from "~~/shared/website/website-config.dto";

const ui = {
  pictureWrapper: "grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  noResultWrapper:
    "rounded-lg border border-dashed border-default px-4 py-6 text-sm text-muted",
};

/**
 * Matches image base names allowed for Sirv rename: letters, digits, spaces, hyphens, underscores.
 */
const galleryRenameNamePattern = /^[a-zA-Z0-9\s_-]+$/;

const isValidForRename = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const baseName = trimmed.replace(/\.[^.]+$/, "");
  if (baseName.length === 0) {
    return false;
  }

  return galleryRenameNamePattern.test(baseName);
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

const breakpoints = useBreakpoints(breakpointsTailwind);

const gridColumns = computed(() => {
  if (breakpoints.greaterOrEqual("xl").value) {
    return 4;
  }
  if (breakpoints.greaterOrEqual("md").value) {
    return 3;
  }
  if (breakpoints.greaterOrEqual("sm").value) {
    return 2;
  }
  return 1;
});

const pageSize = computed(() => {
  return getGalleryPageSize(gridColumns.value);
});
const currentPage = ref(1);

const visibleGalleryImages = computed(() => {
  return getGalleryPageSlice(
    galleryImages.value,
    currentPage.value,
    pageSize.value,
  );
});

const showPagination = computed(() => {
  return galleryImages.value.length > pageSize.value;
});

watch(
  () => galleryImages.value.length,
  () => {
    currentPage.value = 1;
  },
);

watch(pageSize, (nextPageSize) => {
  currentPage.value = clampGalleryPage(
    currentPage.value,
    galleryImages.value.length,
    nextPageSize,
  );
});

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
        size: image.size,
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

  if (!isValidForRename(newName)) {
    addToastError({
      title: "Nom invalide",
      description:
        "Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.",
    });
    return;
  }

  renamingPath.value = path;
  const cleanedNewName = newName.trim().toLowerCase().replace(/ /g, "_");
  selectedUrls.value = selectedUrls.value.filter((url) => url !== path);

  try {
    await renamePicture(path, newName);

    const directory = path.split("/").at(1);
    const extension = path.split(".").at(-1);
    const newPath = `/${directory}/${cleanedNewName}.${extension}`;

    /**
     * Only for reactivity update
     */
    let newUrl: URL;
    galleryImages.value = galleryImages.value.map((image) => {
      if (image.path === path) {
        const uppercasedNewName = cleanedNewName
          .replace(/^\w/, (char) => char.toUpperCase())
          .replace(/_/g, " ");

        const originalUrl = new URL(image.url);
        newUrl = new URL(originalUrl.origin);
        newUrl.pathname = newPath;

        const updatedImage = {
          ...image,
          label: uppercasedNewName,
          path: newPath,
          url: newUrl.toString(),
        };

        return updatedImage;
      }

      return image;
    });

    selectedUrls.value = selectedUrls.value.map((url) => {
      if (new URL(url).pathname === path && newUrl) {
        return newUrl.toString();
      }
      return url;
    });

    addToastSuccess({
      title: "Image renommée",
      description: "Le nouveau nom a bien été appliqué.",
    });
  } catch (error) {
    console.error(error);
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
  } catch (error) {
    console.error(error);
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
    const { deletedCount } = await deletePictures(paths);

    addToastSuccess({
      title: `${deletedCount} photos supprimée(s)`,
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
