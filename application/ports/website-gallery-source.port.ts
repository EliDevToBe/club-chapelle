import type { WebsiteGalleryImageDto } from "~~/shared/website/website-config.dto";

export interface WebsiteGallerySource {
  listImagesInDirectory: (
    directory: string,
  ) => Promise<WebsiteGalleryImageDto[]>;
}
