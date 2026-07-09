import type {
  HomepageCarouselSettingsDto,
  WebsiteGalleryDeleteItemResultDto,
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
  WebsiteGalleryUploadItemResultDto,
} from "~~/shared/website/website-config.dto";

type GalleryResponse = {
  images: WebsiteGalleryImageDto[];
};

type HomepageCarouselConfigResponse = {
  settings: HomepageCarouselSettingsDto;
};

type GalleryUploadResponse = {
  results: WebsiteGalleryUploadItemResultDto[];
};

type GalleryRenameResponse = {
  image: WebsiteGalleryImageDto;
};

type GalleryDeleteResponse = {
  results: WebsiteGalleryDeleteItemResultDto[];
  deletedCount: number;
};

export const usePictureManagement = () => {
  const {
    data: galleryData,
    pending: isLoadingGallery,
    error: galleryFetchError,
    refresh: refreshGallery,
  } = useAsyncData<GalleryResponse>(
    "admin-website-gallery",
    async () => {
      return $fetch<GalleryResponse>("/api/admin/website/gallery/gallery", {
        credentials: "include",
      });
    },
    {
      server: false,
      default: () => ({ images: [] }),
    },
  );

  const {
    data: configCarouselData,
    pending: isLoadingCarouselConfig,
    error: carouselConfigFetchError,
    refresh: refreshCarouselConfig,
  } = useAsyncData<HomepageCarouselConfigResponse>(
    "admin-homepage-carousel-config",
    async () => {
      return $fetch<HomepageCarouselConfigResponse>(
        "/api/admin/website-config/homepage-carousel",
        {
          credentials: "include",
        },
      );
    },
    {
      server: false,
      default: () => ({ settings: { data: [] } }),
    },
  );

  const getStorageInfo = async (): Promise<WebsiteGalleryInfos> => {
    return $fetch("/api/admin/website/gallery/infos", {
      credentials: "include",
    });
  };

  const uploadPictures = async (
    files: File[],
  ): Promise<GalleryUploadResponse> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file, file.name);
    }

    const response = await $fetch<GalleryUploadResponse>(
      "/api/admin/website/gallery/upload",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );
    await refreshGallery();

    return response;
  };

  const renamePicture = async (
    path: string,
    newName: string,
  ): Promise<GalleryRenameResponse> => {
    const response = await $fetch<GalleryRenameResponse>(
      "/api/admin/website/gallery/rename",
      {
        method: "PATCH",
        body: {
          path,
          newName,
        },
        credentials: "include",
      },
    );

    return response;
  };

  const deletePictures = async (
    filenames: string[],
  ): Promise<GalleryDeleteResponse> => {
    const response = await $fetch<GalleryDeleteResponse>(
      "/api/admin/website/gallery/delete",
      {
        method: "DELETE",
        body: {
          filenames,
        },
        credentials: "include",
      },
    );
    await Promise.all([refreshGallery(), refreshCarouselConfig()]);

    return response;
  };

  return {
    galleryData,
    isLoadingGallery,
    galleryFetchError,
    refreshGallery,

    configCarouselData,
    isLoadingCarouselConfig,
    carouselConfigFetchError,
    refreshCarouselConfig,

    getStorageInfo,
    uploadPictures,
    renamePicture,
    deletePictures,
  };
};
