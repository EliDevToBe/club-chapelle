import type {
  HomepageCarouselSettingsDto,
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
} from "~~/shared/website/website-config.dto";

type GalleryResponse = {
  images: WebsiteGalleryImageDto[];
};

type HomepageCarouselConfigResponse = {
  settings: HomepageCarouselSettingsDto;
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
      return $fetch("/api/admin/website/gallery/gallery", {
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
      return $fetch("/api/admin/website-config/homepage-carousel", {
        credentials: "include",
      });
    },
    {
      server: false,
      default: () => ({ settings: { data: [] } }),
    },
  );

  const { data: publicCarouselConfigData } =
    useAsyncData<HomepageCarouselConfigResponse>(
      "homepage-carousel-config",
      async () => {
        return $fetch("/api/website-config/homepage-carousel");
      },
      {
        default: () => ({ settings: { data: [] } }),
      },
    );

  const getStorageInfo = async (): Promise<WebsiteGalleryInfos> => {
    return $fetch("/api/admin/website/gallery/infos", {
      credentials: "include",
    });
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

    publicCarouselConfigData,

    getStorageInfo,
  };
};
