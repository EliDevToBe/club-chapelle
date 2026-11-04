import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { GetFeaturedEvent } from "~~/application/website/get-featured-event.use-case";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

describe("GetFeaturedEvent", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("returns seed defaults when no config exists", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const getFeaturedEventHandler = new GetFeaturedEvent(
      repo,
      DEFAULT_FEATURED_EVENT,
    );
    await expect(getFeaturedEventHandler.get()).resolves.toEqual(
      DEFAULT_FEATURED_EVENT,
    );
    expect(repo.findByKey).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.featuredEvent,
    );
  });

  it("merges stored settings with seed defaults", async () => {
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.featuredEvent,
      settings: {
        enabled: false,
        cta_url: "https://example.com/mandat.pdf",
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const getFeaturedEventHandler = new GetFeaturedEvent(
      repo,
      DEFAULT_FEATURED_EVENT,
    );
    await expect(getFeaturedEventHandler.get()).resolves.toEqual({
      ...DEFAULT_FEATURED_EVENT,
      enabled: false,
      cta_url: "https://example.com/mandat.pdf",
    });
  });
});
