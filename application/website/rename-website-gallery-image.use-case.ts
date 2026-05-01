import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import { toHomepageCarouselSettings } from "~~/server/mappers/website-config.mapper";
import type { WebsiteGalleryImageDto } from "~~/shared/website/website-config.dto";

export class RenameWebsiteGalleryImage {
  constructor(
    private readonly source: WebsiteGallerySource,
    private readonly websiteConfigRepository: WebsiteConfigRepository,
  ) {}

  public renameInDirectory = async (
    directory: string,
    fromPath: string,
    newName: string,
  ): Promise<WebsiteGalleryImageDto> => {
    const image = await this.source.renameImage(directory, fromPath, newName);

    const config =
      await this.websiteConfigRepository.findByKey("homepage_carousel");
    if (config) {
      const settings = toHomepageCarouselSettings(config.settings);

      const updatedSettings = settings.data.map((item) => {
        if (new URL(item.url).pathname === fromPath) {
          const { path, ...rest } = image;
          return rest;
        }

        return item;
      });

      await this.websiteConfigRepository.upsert("homepage_carousel", {
        data: updatedSettings,
      });
    }

    return image;
  };
}
