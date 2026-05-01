import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { toHomepageCarouselSettings } from "~~/server/mappers/website-config.mapper";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

type RemoveGalleryImagesFromHomepageCarouselResult = {
  carouselConfigUpdated: boolean;
  removedFromCarouselCount: number;
};

const toPathname = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
};

export class RemoveGalleryImagesFromHomepageCarousel {
  constructor(private readonly configs: WebsiteConfigRepository) {}

  public removeByPaths = async (
    paths: string[],
  ): Promise<RemoveGalleryImagesFromHomepageCarouselResult> => {
    const deletedPaths = new Set(paths);
    if (deletedPaths.size === 0) {
      return {
        carouselConfigUpdated: false,
        removedFromCarouselCount: 0,
      };
    }

    const homepageCarouselConfig = await this.configs.findByKey(
      WEBSITE_CONFIG_KEYS.homepageCarousel,
    );
    if (!homepageCarouselConfig) {
      return {
        carouselConfigUpdated: false,
        removedFromCarouselCount: 0,
      };
    }

    const settings = toHomepageCarouselSettings(
      homepageCarouselConfig.settings,
    );

    const filteredItemsKept = settings.data.filter((item) => {
      const pathname = toPathname(item.url);

      if (!pathname) {
        return true;
      }

      return !deletedPaths.has(pathname);
    });

    const removedFromCarouselCount =
      settings.data.length - filteredItemsKept.length;
    if (removedFromCarouselCount === 0) {
      return {
        carouselConfigUpdated: false,
        removedFromCarouselCount: 0,
      };
    }

    await this.configs.upsert(WEBSITE_CONFIG_KEYS.homepageCarousel, {
      data: filteredItemsKept,
    });

    return {
      carouselConfigUpdated: true,
      removedFromCarouselCount,
    };
  };
}
