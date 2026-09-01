import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { PatchTarifs } from "~~/application/website/patch-tarifs.use-case";
import { cloneTarifs } from "~~/shared/website/tarifs.schema";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

const nextTarifs = {
  title: "Tarifs",
  subtitle: "Licence et inscription",
  intro: "Nos tarifs cette saison :",
  items: [
    {
      id: "tarif-adulte",
      label: "adultes",
      amount: "200 euros",
    },
  ],
  callout_segments: [
    {
      id: "seg-1",
      text: "Écrivez-nous.",
      style: "plain" as const,
      insert_contact_email: false,
    },
  ],
};

describe("PatchTarifs", () => {
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
        key: WEBSITE_CONFIG_KEYS.tarifs,
        settings,
        createdAt: storedAt,
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };
    });

    const patchTarifs = new PatchTarifs(repo);
    const result = await patchTarifs.patch(nextTarifs);

    expect(result.settings).toEqual(nextTarifs);
    expect(repo.upsert).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.tarifs,
      nextTarifs,
    );
    expect(repo.findByKey).not.toHaveBeenCalled();
  });

  it("rejects an empty item label and does not upsert", async () => {
    const invalid = cloneTarifs(DEFAULT_TARIFS);
    const firstItem = invalid.items[0];
    if (!firstItem) {
      throw new Error("seed should include at least one item");
    }
    firstItem.label = "   ";

    const patchTarifs = new PatchTarifs(repo);
    await expect(patchTarifs.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("rejects an empty title and does not upsert", async () => {
    const invalid = cloneTarifs(DEFAULT_TARIFS);
    invalid.title = "";

    const patchTarifs = new PatchTarifs(repo);
    await expect(patchTarifs.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
