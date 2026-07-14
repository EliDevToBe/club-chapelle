import type { FileInfo } from "@sirv/rest-api-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  compareGalleryFileEntries,
  SirvGallerySource,
} from "~~/infrastructure/sirv/sirv-gallery.source";

const connectMock = vi.fn();
const isConnectedMock = vi.fn();
const iterateFolderContentsMock = vi.fn();
const getFileInfoMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("@sirv/rest-api-js", () => {
  class SirvApiError extends Error {
    public readonly statusCode?: number;
    public readonly errorCode?: string;

    constructor(message: string, statusCode?: number, errorCode?: string) {
      super(message);
      this.name = "SirvApiError";
      this.statusCode = statusCode;
      this.errorCode = errorCode;
    }
  }

  return {
    SirvApiError,
    SirvClient: vi.fn().mockImplementation(() => {
      return {
        connect: connectMock,
        isConnected: isConnectedMock,
        iterateFolderContents: iterateFolderContentsMock,
        getFileInfo: getFileInfoMock,
      };
    }),
  };
});

const createAsyncGenerator = <T>(
  items: T[],
): AsyncGenerator<T, void, unknown> => {
  return (async function* () {
    for (const item of items) {
      yield item;
    }
  })();
};

describe("compareGalleryFileEntries", () => {
  it("sorts by filename ascending then creation time descending", () => {
    const directory = "/chapelle";
    const entries: FileInfo[] = [
      {
        filename: "/chapelle/zebra.jpg",
        ctime: "2026-01-01T00:00:00.000Z",
        isDirectory: false,
      },
      {
        filename: "/chapelle/arc.jpg",
        ctime: "2026-01-01T00:00:00.000Z",
        isDirectory: false,
      },
      {
        filename: "/chapelle/arc.jpg",
        ctime: "2020-01-01T00:00:00.000Z",
        isDirectory: false,
      },
    ];

    const sorted = [...entries].sort((left, right) => {
      return compareGalleryFileEntries(left, right, directory);
    });

    expect(sorted.map((entry) => entry.filename)).toEqual([
      "/chapelle/arc.jpg",
      "/chapelle/arc.jpg",
      "/chapelle/zebra.jpg",
    ]);
    expect(sorted[0]?.ctime).toBe("2026-01-01T00:00:00.000Z");
    expect(sorted[1]?.ctime).toBe("2020-01-01T00:00:00.000Z");
  });

  it("falls back to mtime when ctime is missing", () => {
    const directory = "/chapelle";
    const left: FileInfo = {
      filename: "/chapelle/shared-name.jpg",
      mtime: "2026-06-01T00:00:00.000Z",
      isDirectory: false,
    };
    const right: FileInfo = {
      filename: "/chapelle/shared-name.jpg",
      mtime: "2024-06-01T00:00:00.000Z",
      isDirectory: false,
    };

    expect(compareGalleryFileEntries(left, right, directory)).toBeLessThan(0);
  });
});

describe("SirvGallerySource", () => {
  const createSource = (): SirvGallerySource => {
    return new SirvGallerySource({
      clientId: "client-id",
      clientSecret: "client-secret",
      cdnDomain: "archers-chapelle.sirv.com",
    });
  };

  beforeEach(() => {
    connectMock.mockReset();
    isConnectedMock.mockReset();
    iterateFolderContentsMock.mockReset();
    getFileInfoMock.mockReset();
    fetchMock.mockReset();
    connectMock.mockResolvedValue({
      token: "token-1",
      expiresIn: 3600,
      scope: [],
    });
    isConnectedMock.mockReturnValue(false);
    vi.stubGlobal("fetch", fetchMock);
  });

  it("lists image files from iterateFolderContents and builds preview URLs", async () => {
    iterateFolderContentsMock.mockReturnValue(
      createAsyncGenerator([
        {
          filename: "/chapelle/arc.jpg",
          width: 1280,
          height: 720,
          size: 245_760,
          isDirectory: false,
        },
        { filename: "/chapelle/notes.txt", isDirectory: false },
      ]),
    );

    const source = createSource();

    const images = await source.listImagesInDirectory("/chapelle");
    expect(images).toHaveLength(1);
    const [firstImage] = images;
    expect(firstImage).toBeDefined();
    expect(firstImage).toMatchObject({
      path: "/chapelle/arc.jpg",
      label: "Arc",
      url: "https://archers-chapelle.sirv.com/chapelle/arc.jpg",
      width: 1280,
      height: 720,
      size: 245_760,
    });
    expect(firstImage?.preview_url).toContain("w=240");
    expect(firstImage?.preview_url).toContain("h=160");
    expect(iterateFolderContentsMock).toHaveBeenCalledWith("/chapelle");
  });

  it("aggregates entries yielded across multiple Sirv continuation pages", async () => {
    iterateFolderContentsMock.mockReturnValue(
      createAsyncGenerator([
        {
          filename: "/chapelle/first-batch.jpg",
          width: 640,
          height: 480,
          isDirectory: false,
        },
        {
          filename: "/chapelle/second-batch.jpg",
          width: 800,
          height: 600,
          isDirectory: false,
        },
      ]),
    );

    const source = createSource();
    const images = await source.listImagesInDirectory("/chapelle");

    expect(images).toHaveLength(2);
    expect(images.map((image) => image.path)).toEqual([
      "/chapelle/first-batch.jpg",
      "/chapelle/second-batch.jpg",
    ]);
  });

  it("sorts listed images by filename ascending then creation time descending", async () => {
    iterateFolderContentsMock.mockReturnValue(
      createAsyncGenerator([
        {
          filename: "/chapelle/zebra.jpg",
          ctime: "2026-01-01T00:00:00.000Z",
          width: 640,
          height: 480,
          isDirectory: false,
        },
        {
          filename: "/chapelle/arc.jpg",
          ctime: "2020-01-01T00:00:00.000Z",
          width: 640,
          height: 480,
          isDirectory: false,
        },
        {
          filename: "/chapelle/arc.jpg",
          ctime: "2026-01-01T00:00:00.000Z",
          width: 640,
          height: 480,
          isDirectory: false,
        },
      ]),
    );

    const source = createSource();
    const images = await source.listImagesInDirectory("/chapelle");

    expect(images.map((image) => image.path)).toEqual([
      "/chapelle/arc.jpg",
      "/chapelle/arc.jpg",
      "/chapelle/zebra.jpg",
    ]);
  });

  it("connects once when already connected afterwards", async () => {
    isConnectedMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    iterateFolderContentsMock.mockReturnValue(
      createAsyncGenerator([
        {
          filename: "/chapelle/arc.jpg",
          width: 1280,
          height: 720,
          isDirectory: false,
        },
      ]),
    );

    const source = createSource();

    await source.listImagesInDirectory("/chapelle");
    await source.listImagesInDirectory("/chapelle");
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it("uploads images through Sirv API and maps successful results", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ token: "sirv-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
      });
    getFileInfoMock.mockResolvedValue({
      filename: "/chapelle/uploaded-arc.jpg",
      width: 640,
      height: 480,
      mtime: "2026-04-25T00:00:00.000Z",
      contentType: "image/jpeg",
      size: 12_288,
    });

    const source = createSource();

    const results = await source.uploadImages("/chapelle", [
      {
        filename: "uploaded-arc.jpg",
        data: Buffer.from([1, 2, 3]),
        contentType: "image/jpeg",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.sirv.com/v2/token",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.sirv.com/v2/files/upload?filename=%2Fchapelle%2Fuploaded-arc.jpg",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sirv-token",
          "content-type": "image/jpeg",
        }),
      }),
    );
    expect(results).toEqual([
      {
        filename: "uploaded-arc.jpg",
        success: true,
        image: {
          path: "/chapelle/uploaded-arc.jpg",
          label: "Uploaded-arc",
          url: "https://archers-chapelle.sirv.com/chapelle/uploaded-arc.jpg",
          preview_url:
            "https://archers-chapelle.sirv.com/chapelle/uploaded-arc.jpg?w=240&h=160&q=85",
          width: 640,
          height: 480,
          size: 12_288,
          mtime: "2026-04-25T00:00:00.000Z",
          mimetype: "image/jpeg",
        },
      },
    ]);
  });

  it("renames an image while keeping extension by default", async () => {
    const { SirvApiError } = await import("@sirv/rest-api-js");
    getFileInfoMock
      .mockRejectedValueOnce(new SirvApiError("Not Found", 404))
      .mockResolvedValueOnce({
        filename: "/chapelle/arc_renamed.jpg",
        width: 640,
        height: 480,
        mtime: "2026-04-25T00:00:00.000Z",
      });
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ token: "sirv-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
      });

    const source = createSource();

    const image = await source.renameImage(
      "/chapelle",
      "/chapelle/arc-original.jpg",
      "Arc Renamed",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer sirv-token",
        },
      }),
    );

    const renameUrl = fetchMock.mock.calls[1]?.[0];
    expect(renameUrl).toBeInstanceOf(URL);
    expect((renameUrl as URL).pathname).toBe("/v2/files/rename");
    expect((renameUrl as URL).searchParams.get("from")).toBe(
      "/chapelle/arc-original.jpg",
    );
    expect((renameUrl as URL).searchParams.get("to")).toBe(
      "/chapelle/arc_renamed.jpg",
    );
    expect(image.path).toBe("/chapelle/arc_renamed.jpg");
  });

  it("deletes images through Sirv API and returns per-item results", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ token: "sirv-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

    const source = createSource();

    const results = await source.deleteImages("/chapelle", [
      "/chapelle/arc.jpg",
      "/chapelle/missing.jpg",
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.sirv.com/v2/token",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer sirv-token",
        },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
      }),
    );

    const firstDeleteUrl = fetchMock.mock.calls[1]?.[0];
    const secondDeleteUrl = fetchMock.mock.calls[2]?.[0];
    expect(firstDeleteUrl).toBeInstanceOf(URL);
    expect((firstDeleteUrl as URL).pathname).toBe("/v2/files/delete");
    expect((firstDeleteUrl as URL).searchParams.get("filename")).toBe(
      "/chapelle/arc.jpg",
    );
    expect(secondDeleteUrl).toBeInstanceOf(URL);
    expect((secondDeleteUrl as URL).searchParams.get("filename")).toBe(
      "/chapelle/missing.jpg",
    );
    expect(results).toEqual([
      {
        path: "/chapelle/arc.jpg",
        success: true,
      },
      {
        path: "/chapelle/missing.jpg",
        success: false,
        error: "Sirv delete failed: 404 Not Found",
      },
    ]);
  });
});
