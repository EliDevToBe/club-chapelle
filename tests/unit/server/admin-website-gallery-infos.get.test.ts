import type { H3Event } from "h3";
import { createError } from "h3";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { requireRoles } from "~~/server/utils/rbac";

const { getStorageInfoMock, SirvGallerySourceMock, useRuntimeConfigMock } =
  vi.hoisted(() => {
    const getStorageInfo = vi.fn();
    return {
      getStorageInfoMock: getStorageInfo,
      SirvGallerySourceMock: vi.fn().mockImplementation(() => ({
        getStorageInfo,
      })),
      useRuntimeConfigMock: vi.fn(),
    };
  });

vi.mock("~~/infrastructure/sirv/sirv-gallery.source", () => ({
  SirvGallerySource: SirvGallerySourceMock,
}));

let getAdminGalleryInfos: (event: H3Event) => Promise<unknown>;

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
  vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
  vi.stubGlobal("useRuntimeConfig", useRuntimeConfigMock);
  vi.stubGlobal("requireRoles", requireRoles);
  vi.stubGlobal("createError", createError);
  const mod = await import("~~/server/api/admin/website/gallery/infos.get");
  getAdminGalleryInfos = mod.default as (event: H3Event) => Promise<unknown>;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  useRuntimeConfigMock.mockImplementation(() => ({
    sirvApiClientId: "client-id",
    sirvApiClientSecret: "secret",
    sirvCdnDomain: "https://cdn.example.com",
  }));
  getStorageInfoMock.mockResolvedValue({
    allowance: 5_000_000_000,
    used: 50,
    files: 5,
  });
  SirvGallerySourceMock.mockClear();
});

describe("GET /api/admin/website/gallery/infos", () => {
  it("returns Sirv storage info for an authenticated admin", async () => {
    const result = await getAdminGalleryInfos(adminEvent);
    expect(result).toEqual({
      allowance: 5_000_000_000,
      used: 50,
      files: 5,
    });
    expect(SirvGallerySourceMock).toHaveBeenCalledWith({
      clientId: "client-id",
      clientSecret: "secret",
      cdnDomain: "https://cdn.example.com",
    });
    expect(getStorageInfoMock).toHaveBeenCalledOnce();
  });

  it("responds with 500 when Sirv runtime configuration is incomplete", async () => {
    useRuntimeConfigMock.mockImplementation(() => ({
      sirvApiClientId: "",
      sirvApiClientSecret: "secret",
      sirvCdnDomain: "cdn.example.com",
    }));
    await expect(getAdminGalleryInfos(adminEvent)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Sirv runtime configuration is missing",
    });
    expect(SirvGallerySourceMock).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const event = { context: {} } as unknown as H3Event;
    await expect(getAdminGalleryInfos(event)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
