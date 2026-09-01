import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { GetTarifs } from "~~/application/website/get-tarifs.use-case";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

describe("GetTarifs", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("returns seed defaults when no config exists", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const getTarifsHandler = new GetTarifs(repo, DEFAULT_TARIFS);
    await expect(getTarifsHandler.get()).resolves.toEqual(DEFAULT_TARIFS);
    expect(repo.findByKey).toHaveBeenCalledWith(WEBSITE_CONFIG_KEYS.tarifs);
  });

  it("merges stored settings with seed defaults", async () => {
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.tarifs,
      settings: {
        intro: "Tarifs mis à jour",
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const getTarifsHandler = new GetTarifs(repo, DEFAULT_TARIFS);
    await expect(getTarifsHandler.get()).resolves.toEqual({
      ...DEFAULT_TARIFS,
      intro: "Tarifs mis à jour",
    });
  });
});
