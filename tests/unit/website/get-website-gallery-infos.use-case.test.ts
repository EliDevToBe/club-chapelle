import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteGallerySource } from "~~/application/ports/website-gallery-source.port";
import { GetWebsiteGalleryInfos } from "~~/application/website/get-website-gallery-infos.use-case";

describe("GetWebsiteGalleryInfos", () => {
  let source: WebsiteGallerySource;

  beforeEach(() => {
    source = {
      listImagesInDirectory: vi.fn(),
      getStorageInfo: vi.fn(),
    };
  });

  it("returns storage info from the gallery source", async () => {
    const infos = {
      allowance: 5_000_000_000,
      used: 200,
      files: 20,
      burstable: 100,
    };
    source.getStorageInfo = vi.fn().mockResolvedValue(infos);

    const getWebsiteGalleryInfos = new GetWebsiteGalleryInfos(source);
    await expect(getWebsiteGalleryInfos.getInfos()).resolves.toEqual(infos);
    expect(source.getStorageInfo).toHaveBeenCalledOnce();
  });
});
