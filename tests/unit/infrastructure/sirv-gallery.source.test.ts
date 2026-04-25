import { beforeEach, describe, expect, it, vi } from "vitest";
import { SirvGallerySource } from "~~/infrastructure/sirv/sirv-gallery.source";

const connectMock = vi.fn();
const isConnectedMock = vi.fn();
const readFolderContentsMock = vi.fn();

vi.mock("@sirv/rest-api-js", () => {
  return {
    SirvClient: vi.fn().mockImplementation(() => {
      return {
        connect: connectMock,
        isConnected: isConnectedMock,
        readFolderContents: readFolderContentsMock,
      };
    }),
  };
});

describe("SirvGallerySource", () => {
  beforeEach(() => {
    connectMock.mockReset();
    isConnectedMock.mockReset();
    readFolderContentsMock.mockReset();
    connectMock.mockResolvedValue({
      token: "token-1",
      expiresIn: 3600,
      scope: [],
    });
    isConnectedMock.mockReturnValue(false);
  });

  it("lists image files and builds preview URLs", async () => {
    readFolderContentsMock.mockResolvedValue({
      contents: [
        { filename: "/chapelle/arc.jpg", width: 1280, height: 720 },
        { filename: "/chapelle/notes.txt" },
      ],
    });

    const source = new SirvGallerySource({
      clientId: "client-id",
      clientSecret: "client-secret",
      cdnDomain: "archers-chapelle.sirv.com",
    });

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
    });
    expect(firstImage?.preview_url).toContain("w=240");
    expect(firstImage?.preview_url).toContain("h=160");
    expect(readFolderContentsMock).toHaveBeenCalledWith("/chapelle");
  });

  it("connects once when already connected afterwards", async () => {
    isConnectedMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    readFolderContentsMock.mockResolvedValue({
      contents: [{ filename: "/chapelle/arc.jpg", width: 1280, height: 720 }],
    });

    const source = new SirvGallerySource({
      clientId: "client-id",
      clientSecret: "client-secret",
      cdnDomain: "archers-chapelle.sirv.com",
    });

    await source.listImagesInDirectory("/chapelle");
    await source.listImagesInDirectory("/chapelle");
    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});
