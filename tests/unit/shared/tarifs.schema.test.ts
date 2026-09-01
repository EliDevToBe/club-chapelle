import { describe, expect, it } from "vitest";
import {
  cloneTarifs,
  defaultTarifs,
  hasTarifsDocumentFields,
  isCalloutSegmentVisible,
  normaliseTarifs,
  parseTarifs,
} from "~~/shared/website/tarifs.schema";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";

describe("defaultTarifs", () => {
  it("returns the seed document", () => {
    expect(defaultTarifs(DEFAULT_TARIFS)).toEqual(DEFAULT_TARIFS);
  });
});

describe("cloneTarifs", () => {
  it("returns a deep copy of items and callout segments", () => {
    const cloned = cloneTarifs(DEFAULT_TARIFS);
    const clonedItem = cloned.items[0];
    const seedItem = DEFAULT_TARIFS.items[0];

    if (!clonedItem || !seedItem) {
      throw new Error("seed should include at least one item");
    }

    expect(cloned).toEqual(DEFAULT_TARIFS);
    clonedItem.label = "changed";
    expect(seedItem.label).toBe("adultes");
  });
});

describe("normaliseTarifs", () => {
  it("falls back to seed when raw is null", () => {
    expect(normaliseTarifs(null, DEFAULT_TARIFS)).toEqual(DEFAULT_TARIFS);
  });

  it("keeps an empty stored subtitle instead of the seed", () => {
    expect(
      normaliseTarifs(
        {
          title: DEFAULT_TARIFS.title,
          subtitle: "",
          intro: DEFAULT_TARIFS.intro,
          items: DEFAULT_TARIFS.items,
          callout_segments: DEFAULT_TARIFS.callout_segments,
        },
        { ...DEFAULT_TARIFS, subtitle: "Ancien sous-titre" },
      ).subtitle,
    ).toBe("");
  });

  it("falls back to the seed title when stored settings omit it", () => {
    expect(
      normaliseTarifs(
        {
          intro: DEFAULT_TARIFS.intro,
          items: DEFAULT_TARIFS.items,
          callout_segments: DEFAULT_TARIFS.callout_segments,
        },
        DEFAULT_TARIFS,
      ).title,
    ).toBe(DEFAULT_TARIFS.title);
  });

  it("keeps a stored empty items list instead of replacing with seed", () => {
    expect(
      normaliseTarifs(
        {
          title: DEFAULT_TARIFS.title,
          intro: DEFAULT_TARIFS.intro,
          items: [],
          callout_segments: DEFAULT_TARIFS.callout_segments,
        },
        DEFAULT_TARIFS,
      ).items,
    ).toEqual([]);
  });

  it("falls back to seed when a stored item is invalid", () => {
    expect(
      normaliseTarifs(
        {
          title: DEFAULT_TARIFS.title,
          intro: DEFAULT_TARIFS.intro,
          callout_segments: DEFAULT_TARIFS.callout_segments,
          items: [
            {
              id: "broken",
              label: "",
              amount: "195 euros",
            },
          ],
        },
        DEFAULT_TARIFS,
      ),
    ).toEqual(DEFAULT_TARIFS);
  });
});

describe("parseTarifs", () => {
  it("parses and trims a valid document", () => {
    expect(
      parseTarifs({
        title: "  Tarifs  ",
        subtitle: "  Saison  ",
        intro: "  Intro  ",
        items: [
          {
            id: "item-1",
            label: "  adultes  ",
            amount: "  195 euros  ",
          },
        ],
        callout_segments: [
          {
            id: "seg-1",
            text: " avant ",
            style: "highlight",
            insert_contact_email: false,
          },
        ],
      }),
    ).toEqual({
      title: "Tarifs",
      subtitle: "Saison",
      intro: "Intro",
      items: [
        {
          id: "item-1",
          label: "adultes",
          amount: "195 euros",
        },
      ],
      callout_segments: [
        {
          id: "seg-1",
          text: " avant ",
          style: "highlight",
          insert_contact_email: false,
        },
      ],
    });
  });

  it("preserves leading and trailing spaces in callout text", () => {
    expect(
      parseTarifs({
        title: "Tarifs",
        intro: "Intro",
        items: DEFAULT_TARIFS.items,
        callout_segments: [
          {
            id: "seg-1",
            text: " afin de savoir",
            style: "plain",
            insert_contact_email: false,
          },
        ],
      }).callout_segments[0]?.text,
    ).toBe(" afin de savoir");
  });

  it("rejects an empty title", () => {
    expect(() => {
      return parseTarifs({
        title: "   ",
        intro: "Intro",
        items: DEFAULT_TARIFS.items,
        callout_segments: [],
      });
    }).toThrow();
  });

  it("rejects an empty item label", () => {
    expect(() => {
      return parseTarifs({
        title: "Tarifs",
        intro: "Intro",
        items: [
          {
            id: "item-1",
            label: "   ",
            amount: "195 euros",
          },
        ],
        callout_segments: [],
      });
    }).toThrow();
  });
});

describe("isCalloutSegmentVisible", () => {
  it("treats contact-email placeholders as visible", () => {
    expect(
      isCalloutSegmentVisible({
        id: "seg-email",
        text: "",
        style: "highlight",
        insert_contact_email: true,
      }),
    ).toBe(true);
  });

  it("hides empty text segments without an email placeholder", () => {
    expect(
      isCalloutSegmentVisible({
        id: "seg-empty",
        text: "",
        style: "plain",
        insert_contact_email: false,
      }),
    ).toBe(false);
  });
});

describe("hasTarifsDocumentFields", () => {
  it("requires title, subtitle, intro, items, and callout_segments", () => {
    expect(
      hasTarifsDocumentFields({
        title: "Tarifs",
        subtitle: "",
        intro: "Intro",
        items: [],
        callout_segments: [],
      }),
    ).toBe(true);
    expect(
      hasTarifsDocumentFields({
        title: "Tarifs",
        intro: "Intro",
        items: [],
      }),
    ).toBe(false);
  });
});
