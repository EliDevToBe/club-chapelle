import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import type { WebsiteGalleryInfos } from "~~/shared/website/website-config.dto";

export class GetWebsiteGalleryInfos {
  constructor(private readonly source: WebsiteGallerySource) {}

  public getInfos = async (): Promise<WebsiteGalleryInfos> => {
    return this.source.getStorageInfo();
  };
}
