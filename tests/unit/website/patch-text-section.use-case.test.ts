import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteConfigRepository } from "~~/application/ports/website-config-repository.port";
import { PatchTextSection } from "~~/application/website/patch-text-section.use-case";
import { cloneTextSection } from "~~/shared/website/text-section.schema";
import { DEFAULT_INFOS_INTRODUCTION } from "~~/shared/website/text-section.seed";
import { TEXT_SECTION_KEYS } from "~~/shared/website/website-config.keys";

const nextSection = {
  title: "Infos du club",
  subtitle: "Qui sommes-nous ?",
  paragraphs: ["Premier paragraphe.", "Second paragraphe."],
};

describe("PatchTextSection", () => {
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
        key: TEXT_SECTION_KEYS.infosIntroduction,
        settings,
        createdAt: storedAt,
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      };
    });

    const patchTextSection = new PatchTextSection(repo);
    const result = await patchTextSection.patch(
      TEXT_SECTION_KEYS.infosIntroduction,
      nextSection,
    );

    expect(result.settings).toEqual(nextSection);
    expect(repo.upsert).toHaveBeenCalledWith(
      TEXT_SECTION_KEYS.infosIntroduction,
      nextSection,
    );
    expect(repo.findByKey).not.toHaveBeenCalled();
  });

  it("rejects an empty title and does not upsert", async () => {
    const invalid = cloneTextSection(DEFAULT_INFOS_INTRODUCTION);
    invalid.title = "   ";

    const patchTextSection = new PatchTextSection(repo);
    await expect(
      patchTextSection.patch(TEXT_SECTION_KEYS.infosIntroduction, invalid),
    ).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("rejects a document with no paragraphs and does not upsert", async () => {
    const invalid = cloneTextSection(DEFAULT_INFOS_INTRODUCTION);
    invalid.paragraphs = [];

    const patchTextSection = new PatchTextSection(repo);
    await expect(
      patchTextSection.patch(TEXT_SECTION_KEYS.infosIntroduction, invalid),
    ).rejects.toThrow();
    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
