import type { H3Event } from "h3";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  useRuntimeConfigMock,
  readMultipartFormDataMock,
  readBodyMock,
  uploadImagesMock,
  renameImageMock,
  deleteImagesMock,
  findByKeyMock,
  upsertMock,
  SirvGallerySourceMock,
} = vi.hoisted(() => {
  const uploadImages = vi.fn();
  const renameImage = vi.fn();
  const deleteImages = vi.fn();
  const findByKey = vi.fn();
  const upsert = vi.fn();

  return {
    useRuntimeConfigMock: vi.fn(),
    readMultipartFormDataMock: vi.fn(),
    readBodyMock: vi.fn(),
    uploadImagesMock: uploadImages,
    renameImageMock: renameImage,
    deleteImagesMock: deleteImages,
    findByKeyMock: findByKey,
    upsertMock: upsert,
    SirvGallerySourceMock: vi.fn().mockImplementation(() => ({
      uploadImages,
      renameImage,
      deleteImages,
    })),
  };
});

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return {
    ...actual,
    defineEventHandler: (handler: unknown) => handler,
    readMultipartFormData: readMultipartFormDataMock,
    readBody: readBodyMock,
  };
});

vi.mock("~~/infrastructure/sirv/sirv-gallery.source", () => ({
  SirvGallerySource: SirvGallerySourceMock,
}));

vi.mock("~~/infrastructure/persistence/repositories.provider", () => ({
  getRepositories: vi.fn().mockImplementation(() => ({
    websiteConfigRepository: {
      findByKey: findByKeyMock,
      upsert: upsertMock,
    },
  })),
}));

let uploadGalleryImagesHandler: (event: H3Event) => Promise<unknown>;
let renameGalleryImageHandler: (event: H3Event) => Promise<unknown>;
let deleteGalleryImagesHandler: (event: H3Event) => Promise<unknown>;

const adminEvent = {
  context: {
    authUser: {
      id: "u-admin",
      name: "Admin",
      roles: ["admin"],
      authenticated: true,
    },
  },
} as unknown as H3Event;

beforeAll(async () => {
  const uploadMod = await import(
    "~~/server/api/admin/website/gallery/upload.post"
  );
  const renameMod = await import(
    "~~/server/api/admin/website/gallery/rename.patch"
  );
  const deleteMod = await import(
    "~~/server/api/admin/website/gallery/delete.delete"
  );
  uploadGalleryImagesHandler = uploadMod.default as (
    event: H3Event,
  ) => Promise<unknown>;
  renameGalleryImageHandler = renameMod.default as (
    event: H3Event,
  ) => Promise<unknown>;
  deleteGalleryImagesHandler = deleteMod.default as (
    event: H3Event,
  ) => Promise<unknown>;
});

afterAll(() => {
  vi.resetAllMocks();
});

beforeEach(() => {
  useRuntimeConfigMock.mockImplementation(() => ({
    sirvApiClientId: "client-id",
    sirvApiClientSecret: "client-secret",
    sirvCdnDomain: "https://cdn.example.com",
    sirvDirectory: "/chapelle",
  }));
  readMultipartFormDataMock.mockResolvedValue([
    {
      name: "files",
      filename: "arc.jpg",
      data: Buffer.from([1, 2, 3]),
      type: "image/jpeg",
    },
  ]);
  readBodyMock.mockResolvedValue({
    path: "/chapelle/arc.jpg",
    newName: "arc-renamed",
  });
  uploadImagesMock.mockResolvedValue([
    {
      filename: "arc.jpg",
      success: true,
      image: {
        path: "/chapelle/arc.jpg",
        label: "Arc",
        url: "https://cdn.example.com/chapelle/arc.jpg",
        preview_url: "https://cdn.example.com/chapelle/arc.jpg?w=240&h=160",
        mimetype: "image/jpg",
        width: 240,
        height: 160,
        size: 0,
        mtime: null,
      },
    },
  ]);
  renameImageMock.mockResolvedValue({
    path: "/chapelle/arc-renamed.jpg",
    label: "Arc Renamed",
    url: "https://cdn.example.com/chapelle/arc-renamed.jpg",
    preview_url: "https://cdn.example.com/chapelle/arc-renamed.jpg?w=240&h=160",
    width: 240,
    height: 160,
    size: 0,
    mtime: null,
  });
  deleteImagesMock.mockResolvedValue([
    {
      path: "/chapelle/arc.jpg",
      success: true,
    },
  ]);
  findByKeyMock.mockResolvedValue({
    id: "cfg-homepage-carousel",
    key: "homepageCarousel",
    settings: {
      data: [
        {
          label: "Arc",
          url: "https://cdn.example.com/chapelle/arc.jpg",
          preview_url: "https://cdn.example.com/chapelle/arc.jpg?w=240&h=160",
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
      ],
    },
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-02T00:00:00.000Z"),
  });
  upsertMock.mockResolvedValue({
    id: "cfg-homepage-carousel",
    key: "homepageCarousel",
    settings: { data: [] },
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-02T00:00:00.000Z"),
  });
  SirvGallerySourceMock.mockClear();
});

describe("Admin gallery upload and rename endpoints", () => {
  it("uploads multiple images payload", async () => {
    const result = await uploadGalleryImagesHandler(adminEvent);
    expect(result).toEqual({
      results: [
        {
          filename: "arc.jpg",
          success: true,
          image: {
            path: "/chapelle/arc.jpg",
            label: "Arc",
            url: "https://cdn.example.com/chapelle/arc.jpg",
            preview_url: "https://cdn.example.com/chapelle/arc.jpg?w=240&h=160",
            mimetype: "image/jpg",
            width: 240,
            height: 160,
            size: 0,
            mtime: null,
          },
        },
      ],
    });
    expect(uploadImagesMock).toHaveBeenCalledWith("/chapelle", [
      {
        filename: "arc.jpg",
        data: Buffer.from([1, 2, 3]),
        contentType: "image/jpeg",
      },
    ]);
  });

  it("rejects upload when multipart body is missing", async () => {
    readMultipartFormDataMock.mockResolvedValue(undefined);

    await expect(uploadGalleryImagesHandler(adminEvent)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "No files were provided",
    });
  });

  it("renames an uploaded image", async () => {
    const result = await renameGalleryImageHandler(adminEvent);
    expect(result).toEqual({
      image: {
        path: "/chapelle/arc-renamed.jpg",
        label: "Arc Renamed",
        url: "https://cdn.example.com/chapelle/arc-renamed.jpg",
        preview_url:
          "https://cdn.example.com/chapelle/arc-renamed.jpg?w=240&h=160",
        width: 240,
        height: 160,
        size: 0,
        mtime: null,
      },
    });
    expect(renameImageMock).toHaveBeenCalledWith(
      "/chapelle",
      "/chapelle/arc.jpg",
      "arc-renamed",
    );
  });

  it("rejects invalid rename body", async () => {
    readBodyMock.mockResolvedValue({ path: "", newName: "" });
    await expect(renameGalleryImageHandler(adminEvent)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  });

  it("deletes gallery images and cleans homepage carousel", async () => {
    readBodyMock.mockResolvedValue({
      filenames: ["/chapelle/arc.jpg"],
    });

    const result = await deleteGalleryImagesHandler(adminEvent);
    expect(result).toEqual({
      results: [
        {
          path: "/chapelle/arc.jpg",
          success: true,
        },
      ],
      deletedCount: 1,
    });
    expect(deleteImagesMock).toHaveBeenCalledWith("/chapelle", [
      "/chapelle/arc.jpg",
    ]);
    expect(upsertMock).toHaveBeenCalledWith("homepage_carousel", {
      data: [
        {
          label: "Other",
          url: "https://cdn.example.com/chapelle/other.jpg",
          preview_url: "https://cdn.example.com/chapelle/other.jpg?w=240&h=160",
          width: 240,
          height: 160,
          size: 0,
          mtime: null,
          mimetype: "image/jpg",
        },
      ],
    });
  });

  it("rejects invalid delete body", async () => {
    readBodyMock.mockResolvedValue({ filenames: [] });
    await expect(deleteGalleryImagesHandler(adminEvent)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  });

  it("requires authentication", async () => {
    const event = { context: {} } as unknown as H3Event;
    await expect(uploadGalleryImagesHandler(event)).rejects.toMatchObject({
      statusCode: 401,
    });
    await expect(deleteGalleryImagesHandler(event)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
