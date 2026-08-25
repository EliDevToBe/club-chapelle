import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { PatchSiteSettings } from "~~/application/website/patch-site-settings.use-case";
import { EMPTY_LEGAL_IDENTITY_SETTINGS } from "~~/shared/website/site-settings.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

const seed = {
  contact_email: "club@example.com",
  club_address: "Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS",
  instagram_url: "https://www.instagram.com/les_archers_de_la_chapelle",
  facebook_url: "https://www.facebook.com/archersdelachapelle",
  ...EMPTY_LEGAL_IDENTITY_SETTINGS,
};

describe("PatchSiteSettings", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("merges a contact patch onto stored legal identity", async () => {
    const storedAt = new Date("2026-01-01T00:00:00.000Z");
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.siteSettings,
      settings: {
        ...seed,
        publication_director: "Jane Doe",
        rna_number: "W123456789",
      },
      createdAt: storedAt,
      updatedAt: storedAt,
    });
    repo.upsert = vi.fn().mockImplementation(async (_key, settings) => {
      return {
        key: WEBSITE_CONFIG_KEYS.siteSettings,
        settings,
        createdAt: storedAt,
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };
    });

    const patchSiteSettings = new PatchSiteSettings(repo, seed);
    const result = await patchSiteSettings.patch({
      contact_email: "new@example.com",
      club_address: "Autre gymnase",
      instagram_url: "https://www.instagram.com/new",
      facebook_url: "https://www.facebook.com/new",
    });

    const expectedSettings = {
      ...seed,
      contact_email: "new@example.com",
      club_address: "Autre gymnase",
      instagram_url: "https://www.instagram.com/new",
      facebook_url: "https://www.facebook.com/new",
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    };

    expect(result.settings).toEqual(expectedSettings);
    expect(repo.upsert).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.siteSettings,
      expectedSettings,
    );
  });

  it("merges a legal identity patch onto stored contact settings", async () => {
    const storedAt = new Date("2026-01-01T00:00:00.000Z");
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.siteSettings,
      settings: {
        ...seed,
        contact_email: "admin@example.com",
      },
      createdAt: storedAt,
      updatedAt: storedAt,
    });
    repo.upsert = vi.fn().mockImplementation(async (_key, settings) => {
      return {
        key: WEBSITE_CONFIG_KEYS.siteSettings,
        settings,
        createdAt: storedAt,
        updatedAt: storedAt,
      };
    });

    const patchSiteSettings = new PatchSiteSettings(repo, seed);
    const result = await patchSiteSettings.patch({
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    });

    expect(result.settings).toEqual({
      ...seed,
      contact_email: "admin@example.com",
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    });
  });

  it("merges onto seed defaults when no config is stored", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);
    repo.upsert = vi.fn().mockImplementation(async (_key, settings) => {
      return {
        key: WEBSITE_CONFIG_KEYS.siteSettings,
        settings,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
    });

    const patchSiteSettings = new PatchSiteSettings(repo, seed);
    const result = await patchSiteSettings.patch({
      contact_email: "new@example.com",
    });

    expect(result.settings).toEqual({
      ...seed,
      contact_email: "new@example.com",
    });
  });

  it("rejects an invalid contact email in the patch", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const patchSiteSettings = new PatchSiteSettings(repo, seed);
    await expect(
      patchSiteSettings.patch({
        contact_email: "not-an-email",
      }),
    ).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
