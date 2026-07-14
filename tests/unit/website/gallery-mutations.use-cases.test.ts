import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import type {
  WebsiteGallerySource,
  WebsiteGalleryUploadInput,
} from "~~/application/ports/website-gallery-source.port";
import { DeleteWebsiteGalleryImages } from "~~/application/website/delete-website-gallery-images.use-case";
import { RenameWebsiteGalleryImage } from "~~/application/website/rename-website-gallery-image.use-case";
import { UploadWebsiteGalleryImages } from "~~/application/website/upload-website-gallery-images.use-case";

describe("Gallery mutation use cases", () => {
  let source: WebsiteGallerySource;
  let websiteConfigRepository: WebsiteConfigRepository;

  const dataSettings = [
    {
      label: "Old Name",
      url: "https://cdn.example.com/chapelle/old-name.jpg",
      preview_url: "https://cdn.example.com/chapelle/old-name.jpg?w=240&h=160",
      mimetype: "image/jpg",
      width: 240,
      height: 160,
      size: 0,
      mtime: null,
    },
    {
      label: "Other",
      url: "https://cdn.example.com/chapelle/other.jpg",
      preview_url: "https://cdn.example.com/chapelle/other.jpg?w=240&h=160",
      mimetype: "image/jpg",
      width: 240,
      height: 160,
      size: 0,
      mtime: null,
    },
  ];

  beforeEach(() => {
    source = {
      listImagesInDirectory: vi.fn(),
      getStorageInfo: vi.fn(),
      uploadImages: vi.fn(),
      renameImage: vi.fn(),
      deleteImages: vi.fn(),
    };
    websiteConfigRepository = {
      findByKey: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
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
          size: 0,
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
      size: 0,
      mtime: null,
    };
    source.renameImage = vi.fn().mockResolvedValue(expected);

    const renameWebsiteGalleryImage = new RenameWebsiteGalleryImage(
      source,
      websiteConfigRepository,
    );
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
    expect(websiteConfigRepository.upsert).not.toHaveBeenCalled();
  });

  it("renames an image and updates homepage carousel when config exists", async () => {
    const expected = {
      path: "/chapelle/new-name.jpg",
      label: "New Name",
      url: "https://cdn.example.com/chapelle/new-name.jpg",
      preview_url: "https://cdn.example.com/chapelle/new-name.jpg?w=240&h=160",
      mimetype: "image/jpg",
      width: 240,
      height: 160,
      size: 0,
      mtime: null,
    };
    source.renameImage = vi.fn().mockResolvedValue(expected);
    websiteConfigRepository.findByKey = vi.fn().mockResolvedValue({
      key: "homepage_carousel",
      settings: {
        data: dataSettings,
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const renameWebsiteGalleryImage = new RenameWebsiteGalleryImage(
      source,
      websiteConfigRepository,
    );
    await expect(
      renameWebsiteGalleryImage.renameInDirectory(
        "/chapelle",
        "/chapelle/old-name.jpg",
        "new-name",
      ),
    ).resolves.toEqual(expected);
    expect(websiteConfigRepository.upsert).toHaveBeenCalledWith(
      "homepage_carousel",
      {
        data: [
          {
            label: "New Name",
            url: "https://cdn.example.com/chapelle/new-name.jpg",
            preview_url:
              "https://cdn.example.com/chapelle/new-name.jpg?w=240&h=160",
            mimetype: "image/jpg",
            width: 240,
            height: 160,
            size: 0,
            mtime: null,
          },
          dataSettings[1],
        ],
      },
    );
  });

  it("deletes images in a directory", async () => {
    const expected = [
      {
        path: "/chapelle/new-name.jpg",
        success: true,
      },
      {
        path: "/chapelle/missing.jpg",
        success: false,
        error: "Not found",
      },
    ];
    source.deleteImages = vi.fn().mockResolvedValue(expected);

    const deleteWebsiteGalleryImages = new DeleteWebsiteGalleryImages(source);
    await expect(
      deleteWebsiteGalleryImages.deleteInDirectory("/chapelle", [
        "/chapelle/new-name.jpg",
        "/chapelle/missing.jpg",
      ]),
    ).resolves.toEqual(expected);
    expect(source.deleteImages).toHaveBeenCalledWith("/chapelle", [
      "/chapelle/new-name.jpg",
      "/chapelle/missing.jpg",
    ]);
  });
});
