import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { GetSiteSettings } from "~~/application/website/get-site-settings.use-case";
import { EMPTY_LEGAL_IDENTITY_SETTINGS } from "~~/shared/website/site-settings.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

const seed = {
  contact_email: "club@example.com",
  club_address: "Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS",
  instagram_url: "https://www.instagram.com/les_archers_de_la_chapelle",
  facebook_url: "https://www.facebook.com/archersdelachapelle/",
  ...EMPTY_LEGAL_IDENTITY_SETTINGS,
};

describe("GetSiteSettings", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("returns seed defaults when no config exists", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const getSiteSettingsHandler = new GetSiteSettings(repo, seed);
    await expect(getSiteSettingsHandler.get()).resolves.toEqual(seed);
    expect(repo.findByKey).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.siteSettings,
    );
  });

  it("merges stored settings with seed defaults", async () => {
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.siteSettings,
      settings: {
        contact_email: "admin@example.com",
        publication_director: "Jane Doe",
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const getSiteSettingsHandler = new GetSiteSettings(repo, seed);
    await expect(getSiteSettingsHandler.get()).resolves.toEqual({
      ...seed,
      contact_email: "admin@example.com",
      publication_director: "Jane Doe",
    });
  });
});
