import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import type { WebsiteGalleryImageDto } from "~~/shared/website/website-config.dto";

export class RenameWebsiteGalleryImage {
  constructor(private readonly source: WebsiteGallerySource) {}

  public renameInDirectory = async (
    directory: string,
    fromPath: string,
    newName: string,
  ): Promise<WebsiteGalleryImageDto> => {
    return this.source.renameImage(directory, fromPath, newName);
  };
}
