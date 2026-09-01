import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { GetTextSection } from "~~/application/website/get-text-section.use-case";
import { DEFAULT_INFOS_INTRODUCTION } from "~~/shared/website/text-section.seed";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

describe("GetTextSection", () => {
  let repo: WebsiteConfigRepository;

  beforeEach(() => {
    repo = {
      findByKey: vi.fn(),
      upsert: vi.fn(),
    };
  });

  it("returns seed defaults when no config exists", async () => {
    repo.findByKey = vi.fn().mockResolvedValue(null);

    const getTextSectionHandler = new GetTextSection(repo);
    await expect(
      getTextSectionHandler.get(TEXT_SECTION_KEYS.infosIntroduction),
    ).resolves.toEqual(DEFAULT_INFOS_INTRODUCTION);
    expect(repo.findByKey).toHaveBeenCalledWith(
      TEXT_SECTION_KEYS.infosIntroduction,
    );
  });

  it("merges stored settings with seed defaults", async () => {
    repo.findByKey = vi.fn().mockResolvedValue({
      key: TEXT_SECTION_KEYS.infosIntroduction,
      settings: {
        title: "Infos du club",
      },
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const getTextSectionHandler = new GetTextSection(repo);
    await expect(
      getTextSectionHandler.get(TEXT_SECTION_KEYS.infosIntroduction),
    ).resolves.toEqual({
      ...DEFAULT_INFOS_INTRODUCTION,
      title: "Infos du club",
    });
  });
});
