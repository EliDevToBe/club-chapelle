import type {
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
} from "~~/shared/website/website-config.dto";

export interface WebsiteGallerySource {
  listImagesInDirectory: (
    directory: string,
  ) => Promise<WebsiteGalleryImageDto[]>;
  getStorageInfo: () => Promise<WebsiteGalleryInfos>;
}
