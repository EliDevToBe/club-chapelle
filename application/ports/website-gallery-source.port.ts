import type {
  WebsiteGalleryImageDto,
  WebsiteGalleryInfos,
  WebsiteGalleryUploadItemResultDto,
} from "~~/shared/website/website-config.dto";

export type WebsiteGalleryUploadInput = {
  filename: string;
  data: Buffer;
  contentType?: string;
};

export interface WebsiteGallerySource {
  listImagesInDirectory: (
    directory: string,
  ) => Promise<WebsiteGalleryImageDto[]>;
  getStorageInfo: () => Promise<WebsiteGalleryInfos>;
  uploadImages: (
    directory: string,
    files: WebsiteGalleryUploadInput[],
  ) => Promise<WebsiteGalleryUploadItemResultDto[]>;
  renameImage: (
    directory: string,
    fromPath: string,
    newName: string,
  ) => Promise<WebsiteGalleryImageDto>;
}
