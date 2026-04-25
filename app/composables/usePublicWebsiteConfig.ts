import type { HomepageCarouselSettingsDto } from "~~/shared/website/website-config.dto";

type HomepageCarouselConfigResponse = {
  settings: HomepageCarouselSettingsDto;
};

export const usePublicWebsiteConfig = () => {
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

  return {
    publicCarouselConfigData,
  };
};
