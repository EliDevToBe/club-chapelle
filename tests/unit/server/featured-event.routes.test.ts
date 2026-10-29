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
import type { WebsiteConfig } from "~~/domain/website/website-config";
import { requireRoles } from "~~/server/utils/rbac";
import type { FeaturedEvent } from "~~/shared/website/featured-event.schema";

const { findByKeyMock, upsertMock } = vi.hoisted(() => {
  return {
    findByKeyMock: vi.fn(),
    upsertMock: vi.fn(),
  };
});

vi.mock("~~/infrastructure/persistence/repositories.provider", () => ({
  getRepositories: () => ({
    websiteConfigRepository: {
      findByKey: findByKeyMock,
      upsert: upsertMock,
    },
  }),
}));

type RouteHandler = (event: H3Event) => Promise<unknown>;

let getPublicFeaturedEvent: RouteHandler;
let getAdminFeaturedEvent: RouteHandler;
let patchAdminFeaturedEvent: RouteHandler;

const eventWithRoles = (roles: string[]): H3Event => {
  return {
    context: {
      authUser: { id: "u-1", name: "User", roles, authenticated: true },
    },
  } as unknown as H3Event;
};

const anonymousEvent = { context: {} } as unknown as H3Event;

const storedConfig = (settings: FeaturedEvent): WebsiteConfig => {
  return {
    key: "featured_event",
    settings,
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-01T00:00:00Z"),
  };
};

let hiddenEvent: FeaturedEvent;

beforeAll(async () => {
  vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
  vi.stubGlobal("requireRoles", requireRoles);
  vi.stubGlobal("createError", createError);

  const publicModule = await import(
    "~~/server/api/website-config/featured-event.get"
  );
  const adminGetModule = await import(
    "~~/server/api/admin/website-config/featured-event.get"
  );
  const adminPatchModule = await import(
    "~~/server/api/admin/website-config/featured-event.patch"
  );
  getPublicFeaturedEvent = publicModule.default as RouteHandler;
  getAdminFeaturedEvent = adminGetModule.default as RouteHandler;
  patchAdminFeaturedEvent = adminPatchModule.default as RouteHandler;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  hiddenEvent = {
    enabled: false,
    title: "T.E.A.M",
    image_url: "https://example.com/team.png",
    image_alt: "Logo du tournoi",
    paragraphs: ["Inscriptions bientôt ouvertes."],
    cta_label: "Infos & mandat",
    cta_url: "/mandat.pdf",
  };
  findByKeyMock.mockReset();
  findByKeyMock.mockResolvedValue(storedConfig(hiddenEvent));
  upsertMock.mockReset();
});

describe("GET /api/website-config/featured-event", () => {
  it("hides a disabled event's content from visitors", async () => {
    const result = (await getPublicFeaturedEvent(anonymousEvent)) as {
      settings: FeaturedEvent;
    };

    expect(result.settings).toEqual({
      enabled: false,
      title: "",
      image_url: "",
      image_alt: "",
      paragraphs: [],
      cta_label: "",
      cta_url: "",
    });
  });
});

describe("GET /api/admin/website-config/featured-event", () => {
  it("requires authentication", async () => {
    await expect(getAdminFeaturedEvent(anonymousEvent)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("forbids non-Admin roles", async () => {
    await expect(
      getAdminFeaturedEvent(eventWithRoles(["member", "manager"])),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("returns the full hidden event to an Admin", async () => {
    const result = (await getAdminFeaturedEvent(eventWithRoles(["admin"]))) as {
      settings: FeaturedEvent;
    };

    expect(result.settings).toEqual(hiddenEvent);
  });
});

describe("PATCH /api/admin/website-config/featured-event", () => {
  it("requires authentication", async () => {
    await expect(patchAdminFeaturedEvent(anonymousEvent)).rejects.toMatchObject(
      { statusCode: 401 },
    );
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("forbids non-Admin roles before reading the body", async () => {
    await expect(
      patchAdminFeaturedEvent(eventWithRoles(["manager"])),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
