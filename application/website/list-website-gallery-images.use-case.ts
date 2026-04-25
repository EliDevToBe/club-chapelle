import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import type { WebsiteGalleryImageDto } from "~~/shared/website/website-config.dto";

export class ListWebsiteGalleryImages {
  constructor(private readonly source: WebsiteGallerySource) {}

  public listInDirectory = async (
    directory: string,
  ): Promise<WebsiteGalleryImageDto[]> => {
    return this.source.listImagesInDirectory(directory);
  };
}
