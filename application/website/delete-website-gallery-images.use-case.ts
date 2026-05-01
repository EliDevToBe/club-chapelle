import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import type { WebsiteGalleryDeleteItemResultDto } from "~~/shared/website/website-config.dto";

export class DeleteWebsiteGalleryImages {
  constructor(private readonly source: WebsiteGallerySource) {}

  public deleteInDirectory = async (
    directory: string,
    paths: string[],
  ): Promise<WebsiteGalleryDeleteItemResultDto[]> => {
    return this.source.deleteImages(directory, paths);
  };
}
