import type {
  WebsiteGallerySource,
  WebsiteGalleryUploadInput,
} from "~~/application/ports/website-gallery-source.port";
import type { WebsiteGalleryUploadItemResultDto } from "~~/shared/website/website-config.dto";

export class UploadWebsiteGalleryImages {
  constructor(private readonly source: WebsiteGallerySource) {}

  public uploadInDirectory = async (
    directory: string,
    files: WebsiteGalleryUploadInput[],
  ): Promise<WebsiteGalleryUploadItemResultDto[]> => {
    return this.source.uploadImages(directory, files);
  };
}
