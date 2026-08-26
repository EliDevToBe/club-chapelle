import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { PatchOpeningHours } from "~~/application/website/patch-opening-hours.use-case";
import { cloneOpeningHours } from "~~/shared/website/opening-hours.schema";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";
import { WEBSITE_CONFIG_KEYS } from "~~/shared/website/website-config.keys";

const nextHours = {
  intro: "Nous proposons cinq créneaux :",
  epilogue: "Nouveau mot de la fin.",
  slots: [
    {
      id: "slot-vendredi",
      label: "le vendredi soir",
      time_range: "18h à 21h",
      audience: "ouvert à toutes et tous",
      highlight: false,
      highlight_text: "",
    },
  ],
};

describe("PatchOpeningHours", () => {
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
        key: WEBSITE_CONFIG_KEYS.openingHours,
        settings,
        createdAt: storedAt,
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };
    });

    const patchOpeningHours = new PatchOpeningHours(repo);
    const result = await patchOpeningHours.patch(nextHours);

    expect(result.settings).toEqual(nextHours);
    expect(repo.upsert).toHaveBeenCalledWith(
      WEBSITE_CONFIG_KEYS.openingHours,
      nextHours,
    );
    expect(repo.findByKey).not.toHaveBeenCalled();
  });

  it("rejects an empty slot label and does not upsert", async () => {
    const invalid = cloneOpeningHours(DEFAULT_OPENING_HOURS);
    const firstSlot = invalid.slots[0];
    if (!firstSlot) {
      throw new Error("seed should include at least one slot");
    }
    firstSlot.label = "   ";

    const patchOpeningHours = new PatchOpeningHours(repo);
    await expect(patchOpeningHours.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("rejects an empty slot time_range and does not upsert", async () => {
    const invalid = cloneOpeningHours(DEFAULT_OPENING_HOURS);
    const firstSlot = invalid.slots[0];
    if (!firstSlot) {
      throw new Error("seed should include at least one slot");
    }
    firstSlot.time_range = "";

    const patchOpeningHours = new PatchOpeningHours(repo);
    await expect(patchOpeningHours.patch(invalid)).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
