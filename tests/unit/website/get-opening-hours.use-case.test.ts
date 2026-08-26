import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { GetOpeningHours } from "~~/application/website/get-opening-hours.use-case";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

describe("GetOpeningHours", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("returns seed defaults when no config exists", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const getOpeningHoursHandler = new GetOpeningHours(
      repo,
      DEFAULT_OPENING_HOURS,
    );
    await expect(getOpeningHoursHandler.get()).resolves.toEqual(
      DEFAULT_OPENING_HOURS,
    );
    expect(repo.findByKey).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.openingHours,
    );
  });

  it("merges stored settings with seed defaults", async () => {
    repo.findByKey = vi.fn().mockResolvedValue({
      key: WEBSITE_CONFIG_KEYS.openingHours,
      settings: {
        intro: "Horaires mis à jour",
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const getOpeningHoursHandler = new GetOpeningHours(
      repo,
      DEFAULT_OPENING_HOURS,
    );
    await expect(getOpeningHoursHandler.get()).resolves.toEqual({
      ...DEFAULT_OPENING_HOURS,
      intro: "Horaires mis à jour",
    });
  });
});
