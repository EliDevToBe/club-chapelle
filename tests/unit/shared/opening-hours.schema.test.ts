import { describe, expect, it } from "vitest";
import {
  cloneOpeningHours,
  defaultOpeningHours,
  hasOpeningHoursDocumentFields,
  normaliseOpeningHours,
  parseOpeningHours,
} from "~~/shared/website/opening-hours.schema";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";

describe("defaultOpeningHours", () => {
  it("returns the seed document", () => {
    expect(defaultOpeningHours(DEFAULT_OPENING_HOURS)).toEqual(
      DEFAULT_OPENING_HOURS,
    );
  });
});

describe("cloneOpeningHours", () => {
  it("returns a deep copy of slots", () => {
    const cloned = cloneOpeningHours(DEFAULT_OPENING_HOURS);
    const clonedSlot = cloned.slots[0];
    const seedSlot = DEFAULT_OPENING_HOURS.slots[0];

    if (!clonedSlot || !seedSlot) {
      throw new Error("seed should include at least one slot");
    }

    expect(cloned).toEqual(DEFAULT_OPENING_HOURS);
    clonedSlot.label = "changed";
    expect(seedSlot.label).toBe("le lundi soir");
  });
});

describe("normaliseOpeningHours", () => {
  it("falls back to seed when raw is null", () => {
    expect(normaliseOpeningHours(null, DEFAULT_OPENING_HOURS)).toEqual(
      DEFAULT_OPENING_HOURS,
    );
  });

  it("merges a stored intro with seed slots and epilogue", () => {
    expect(
      normaliseOpeningHours(
        {
          intro: "  Nouveau texte d'introduction  ",
        },
        DEFAULT_OPENING_HOURS,
      ),
    ).toEqual({
      ...DEFAULT_OPENING_HOURS,
      intro: "Nouveau texte d'introduction",
    });
  });

  it("keeps a stored empty slots list instead of replacing with seed", () => {
    expect(
      normaliseOpeningHours(
        {
          intro: DEFAULT_OPENING_HOURS.intro,
          slots: [],
          epilogue: DEFAULT_OPENING_HOURS.epilogue,
        },
        DEFAULT_OPENING_HOURS,
      ),
    ).toEqual({
      title: DEFAULT_OPENING_HOURS.title,
      subtitle: DEFAULT_OPENING_HOURS.subtitle,
      intro: DEFAULT_OPENING_HOURS.intro,
      slots: [],
      epilogue: DEFAULT_OPENING_HOURS.epilogue,
    });
  });

  it("keeps an empty stored subtitle instead of the seed", () => {
    expect(
      normaliseOpeningHours(
        {
          title: DEFAULT_OPENING_HOURS.title,
          subtitle: "",
          intro: DEFAULT_OPENING_HOURS.intro,
          slots: DEFAULT_OPENING_HOURS.slots,
          epilogue: DEFAULT_OPENING_HOURS.epilogue,
        },
        { ...DEFAULT_OPENING_HOURS, subtitle: "Ancien sous-titre" },
      ).subtitle,
    ).toBe("");
  });

  it("falls back to the seed title when stored settings omit it", () => {
    expect(
      normaliseOpeningHours(
        {
          intro: DEFAULT_OPENING_HOURS.intro,
          slots: DEFAULT_OPENING_HOURS.slots,
          epilogue: DEFAULT_OPENING_HOURS.epilogue,
        },
        DEFAULT_OPENING_HOURS,
      ).title,
    ).toBe(DEFAULT_OPENING_HOURS.title);
  });

  it("falls back to seed when a stored slot is invalid", () => {
    expect(
      normaliseOpeningHours(
        {
          intro: DEFAULT_OPENING_HOURS.intro,
          epilogue: DEFAULT_OPENING_HOURS.epilogue,
          slots: [
            {
              id: "broken",
              label: "",
              time_range: "19h30 à minuit",
              audience: "",
              highlight: false,
              highlight_text: "",
            },
          ],
        },
        DEFAULT_OPENING_HOURS,
      ),
    ).toEqual(DEFAULT_OPENING_HOURS);
  });

  it("assigns a fallback id and trims slot fields", () => {
    expect(
      normaliseOpeningHours(
        {
          intro: "Intro",
          epilogue: "Outro",
          slots: [
            {
              label: "  le vendredi soir  ",
              time_range: "  18h à 20h  ",
              audience: "  ouvert à toutes et tous  ",
              highlight: true,
              highlight_text: "  dédié à l'initiation  ",
            },
          ],
        },
        DEFAULT_OPENING_HOURS,
      ),
    ).toEqual({
      title: DEFAULT_OPENING_HOURS.title,
      subtitle: DEFAULT_OPENING_HOURS.subtitle,
      intro: "Intro",
      epilogue: "Outro",
      slots: [
        {
          id: "opening-hours-slot-0",
          label: "le vendredi soir",
          time_range: "18h à 20h",
          audience: "ouvert à toutes et tous",
          highlight: true,
          highlight_text: "dédié à l'initiation",
        },
      ],
    });
  });
});

describe("parseOpeningHours", () => {
  it("parses and trims a valid document", () => {
    expect(
      parseOpeningHours({
        title: "  Les créneaux  ",
        subtitle: "  Horaires  ",
        intro: "  Intro  ",
        epilogue: "  Outro  ",
        slots: [
          {
            id: "slot-1",
            label: "  le lundi soir  ",
            time_range: "  19h30 à minuit  ",
            audience: "  confirmé·e·s  ",
            highlight: false,
            highlight_text: "  ",
          },
        ],
      }),
    ).toEqual({
      title: "Les créneaux",
      subtitle: "Horaires",
      intro: "Intro",
      epilogue: "Outro",
      slots: [
        {
          id: "slot-1",
          label: "le lundi soir",
          time_range: "19h30 à minuit",
          audience: "confirmé·e·s",
          highlight: false,
          highlight_text: "",
        },
      ],
    });
  });

  it("allows an empty highlight_text", () => {
    expect(
      parseOpeningHours({
        title: "Les créneaux",
        intro: "Intro",
        epilogue: "Outro",
        slots: [
          {
            id: "slot-1",
            label: "le lundi soir",
            time_range: "19h30 à minuit",
            audience: "",
            highlight: false,
            highlight_text: "",
          },
        ],
      }).slots[0]?.highlight_text,
    ).toBe("");
  });

  it("rejects an empty slot label", () => {
    expect(() => {
      return parseOpeningHours({
        title: "Les créneaux",
        intro: "Intro",
        epilogue: "Outro",
        slots: [
          {
            id: "slot-1",
            label: "   ",
            time_range: "19h30 à minuit",
            audience: "",
            highlight: false,
            highlight_text: "",
          },
        ],
      });
    }).toThrow();
  });

  it("rejects an empty slot time_range", () => {
    expect(() => {
      return parseOpeningHours({
        title: "Les créneaux",
        intro: "Intro",
        epilogue: "Outro",
        slots: [
          {
            id: "slot-1",
            label: "le lundi soir",
            time_range: "",
            audience: "",
            highlight: false,
            highlight_text: "",
          },
        ],
      });
    }).toThrow();
  });
});

describe("hasOpeningHoursDocumentFields", () => {
  it("requires title, subtitle, intro, slots, and epilogue", () => {
    expect(
      hasOpeningHoursDocumentFields({
        title: "Les créneaux",
        subtitle: "",
        intro: "Intro",
        slots: [],
        epilogue: "Outro",
      }),
    ).toBe(true);
    expect(
      hasOpeningHoursDocumentFields({
        intro: "Intro",
        slots: [],
        epilogue: "Outro",
      }),
    ).toBe(false);
  });
});
