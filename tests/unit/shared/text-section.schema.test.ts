import { describe, expect, it } from "vitest";
import {
  cloneTextSection,
  defaultTextSection,
  hasTextSectionDocumentFields,
  normaliseTextSection,
  parseTextSection,
} from "~~/shared/website/text-section.schema";
import { DEFAULT_INFOS_INTRODUCTION } from "~~/shared/website/text-section.seed";

describe("defaultTextSection", () => {
  it("returns the seed document", () => {
    expect(defaultTextSection(DEFAULT_INFOS_INTRODUCTION)).toEqual(
      DEFAULT_INFOS_INTRODUCTION,
    );
  });
});

describe("cloneTextSection", () => {
  it("returns a shallow copy of paragraphs", () => {
    const cloned = cloneTextSection(DEFAULT_INFOS_INTRODUCTION);
    const firstParagraph = cloned.paragraphs[0];

    if (firstParagraph === undefined) {
      throw new Error("seed should include at least one paragraph");
    }

    expect(cloned).toEqual(DEFAULT_INFOS_INTRODUCTION);
    cloned.paragraphs[0] = "changed";
    expect(DEFAULT_INFOS_INTRODUCTION.paragraphs[0]).not.toBe("changed");
  });
});

describe("normaliseTextSection", () => {
  it("falls back to seed when raw is null", () => {
    expect(normaliseTextSection(null, DEFAULT_INFOS_INTRODUCTION)).toEqual(
      DEFAULT_INFOS_INTRODUCTION,
    );
  });

  it("merges a stored title and keeps seed paragraphs", () => {
    expect(
      normaliseTextSection(
        {
          title: "  Infos du club  ",
        },
        DEFAULT_INFOS_INTRODUCTION,
      ),
    ).toEqual({
      ...DEFAULT_INFOS_INTRODUCTION,
      title: "Infos du club",
    });
  });

  it("keeps an empty stored subtitle instead of the seed", () => {
    expect(
      normaliseTextSection(
        {
          title: DEFAULT_INFOS_INTRODUCTION.title,
          subtitle: "",
          paragraphs: DEFAULT_INFOS_INTRODUCTION.paragraphs,
        },
        DEFAULT_INFOS_INTRODUCTION,
      ).subtitle,
    ).toBe("");
  });

  it("falls back to seed paragraphs when the stored list is empty", () => {
    expect(
      normaliseTextSection(
        {
          title: DEFAULT_INFOS_INTRODUCTION.title,
          subtitle: DEFAULT_INFOS_INTRODUCTION.subtitle,
          paragraphs: ["  ", ""],
        },
        DEFAULT_INFOS_INTRODUCTION,
      ).paragraphs,
    ).toEqual(DEFAULT_INFOS_INTRODUCTION.paragraphs);
  });
});

describe("parseTextSection", () => {
  it("parses and trims a valid document", () => {
    expect(
      parseTextSection({
        title: "  Titre  ",
        subtitle: "  Sous-titre  ",
        paragraphs: ["  Premier  ", "  Deuxième  "],
      }),
    ).toEqual({
      title: "Titre",
      subtitle: "Sous-titre",
      paragraphs: ["Premier", "Deuxième"],
    });
  });

  it("drops empty paragraphs", () => {
    expect(
      parseTextSection({
        title: "Titre",
        subtitle: "",
        paragraphs: ["Premier", "   ", "Deuxième"],
      }).paragraphs,
    ).toEqual(["Premier", "Deuxième"]);
  });

  it("rejects an empty title", () => {
    expect(() => {
      return parseTextSection({
        title: "   ",
        subtitle: "",
        paragraphs: ["Un paragraphe"],
      });
    }).toThrow();
  });

  it("rejects a document with no non-empty paragraph", () => {
    expect(() => {
      return parseTextSection({
        title: "Titre",
        subtitle: "",
        paragraphs: ["  ", ""],
      });
    }).toThrow();
  });
});

describe("hasTextSectionDocumentFields", () => {
  it("requires title, subtitle, and paragraphs", () => {
    expect(
      hasTextSectionDocumentFields({
        title: "Titre",
        subtitle: "",
        paragraphs: ["Un paragraphe"],
      }),
    ).toBe(true);
    expect(
      hasTextSectionDocumentFields({
        title: "Titre",
        paragraphs: ["Un paragraphe"],
      }),
    ).toBe(false);
  });
});
