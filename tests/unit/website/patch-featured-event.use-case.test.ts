import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { PatchFeaturedEvent } from "~~/application/website/patch-featured-event.use-case";
import { cloneFeaturedEvent } from "~~/shared/website/featured-event.schema";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

const nextFeaturedEvent = {
  enabled: true,
  title: "T.E.A.M 2027",
  image_url: "https://example.com/team.jpg",
  image_alt: "Équipes sur le pas de tir",
  paragraphs: ["Inscriptions ouvertes."],
  cta_label: "Voir le mandat",
  cta_url: "/documents/mandat-team.pdf",
};

describe("PatchFeaturedEvent", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("replaces the stored document with the parsed payload", async () => {
    const storedAt = new Date("2026-01-01T00:00:00.000Z");
    repo.upsert = vi.fn().mockImplementation(async (_key, settings) => {
      return {
        key: WEBSITE_CONFIG_KEYS.featuredEvent,
        settings,
        createdAt: storedAt,
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };
    });

    const patchFeaturedEvent = new PatchFeaturedEvent(repo);
    const result = await patchFeaturedEvent.patch(nextFeaturedEvent);

    expect(result.settings).toEqual(nextFeaturedEvent);
    expect(repo.upsert).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.featuredEvent,
      nextFeaturedEvent,
    );
    expect(repo.findByKey).not.toHaveBeenCalled();
  });

  it("rejects an empty title and does not upsert", async () => {
    const invalid = cloneFeaturedEvent(DEFAULT_FEATURED_EVENT);
    invalid.title = "";

    const patchFeaturedEvent = new PatchFeaturedEvent(repo);
    await expect(patchFeaturedEvent.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("rejects a javascript: CTA URL and does not upsert", async () => {
    const invalid = cloneFeaturedEvent(DEFAULT_FEATURED_EVENT);
    invalid.cta_url = "javascript:alert(1)";

    const patchFeaturedEvent = new PatchFeaturedEvent(repo);
    await expect(patchFeaturedEvent.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
