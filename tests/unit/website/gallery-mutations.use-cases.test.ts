import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  WebsiteGallerySource,
  WebsiteGalleryUploadInput,
} from "~~/application/ports/website-gallery-source.port";
import { RenameWebsiteGalleryImage } from "~~/application/website/rename-website-gallery-image.use-case";
import { UploadWebsiteGalleryImages } from "~~/application/website/upload-website-gallery-images.use-case";

describe("Gallery mutation use cases", () => {
  let source: WebsiteGallerySource;

  beforeEach(() => {
    source = {
      listImagesInDirectory: vi.fn(),
      getStorageInfo: vi.fn(),
      uploadImages: vi.fn(),
      renameImage: vi.fn(),
    };
  });

  it("uploads images in a directory", async () => {
    const files: WebsiteGalleryUploadInput[] = [
      {
        filename: "arc.jpg",
        data: Buffer.from([1, 2, 3]),
      },
    ];
    const expected = [
      {
        filename: "arc.jpg",
        success: true,
        image: {
          path: "/chapelle/arc.jpg",
          label: "Arc",
          url: "https://cdn.example.com/chapelle/arc.jpg",
          preview_url: "https://cdn.example.com/chapelle/arc.jpg?w=240&h=160",
          width: 240,
          height: 160,
          mtime: null,
        },
      },
    ];
    source.uploadImages = vi.fn().mockResolvedValue(expected);

    const uploadWebsiteGalleryImages = new UploadWebsiteGalleryImages(source);
    await expect(
      uploadWebsiteGalleryImages.uploadInDirectory("/chapelle", files),
    ).resolves.toEqual(expected);
    expect(source.uploadImages).toHaveBeenCalledWith("/chapelle", files);
  });

  it("renames an image in a directory", async () => {
    const expected = {
      path: "/chapelle/new-name.jpg",
      label: "New Name",
      url: "https://cdn.example.com/chapelle/new-name.jpg",
      preview_url: "https://cdn.example.com/chapelle/new-name.jpg?w=240&h=160",
      width: 240,
      height: 160,
      mtime: null,
    };
    source.renameImage = vi.fn().mockResolvedValue(expected);

    const renameWebsiteGalleryImage = new RenameWebsiteGalleryImage(source);
    await expect(
      renameWebsiteGalleryImage.renameInDirectory(
        "/chapelle",
        "/chapelle/old-name.jpg",
        "new-name",
      ),
    ).resolves.toEqual(expected);
    expect(source.renameImage).toHaveBeenCalledWith(
      "/chapelle",
      "/chapelle/old-name.jpg",
      "new-name",
    );
  });
});
