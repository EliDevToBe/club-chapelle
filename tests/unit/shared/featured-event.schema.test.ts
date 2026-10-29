import { beforeEach, describe, expect, it } from "vitest";
import {
  cloneFeaturedEvent,
  defaultFeaturedEvent,
  type FeaturedEvent,
  hasFeaturedEventDocumentFields,
  normaliseFeaturedEvent,
  parseFeaturedEvent,
} from "~~/shared/website/featured-event.schema";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";

const UNSAFE_URLS = [
  "javascript:alert(1)",
  "JavaScript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "//evil.example.com/flyer.pdf",
  "/\\evil.example.com",
  "ftp://example.com/flyer.pdf",
  "mailto:club@example.com",
  "flyer.pdf",
];

describe("defaultFeaturedEvent", () => {
  it("returns the seed document", () => {
    expect(defaultFeaturedEvent(DEFAULT_FEATURED_EVENT)).toEqual(
      DEFAULT_FEATURED_EVENT,
    );
  });
});

describe("cloneFeaturedEvent", () => {
  it("returns a deep copy of the paragraphs", () => {
    const cloned = cloneFeaturedEvent(DEFAULT_FEATURED_EVENT);

    expect(cloned).toEqual(DEFAULT_FEATURED_EVENT);
    cloned.paragraphs[0] = "changed";
    expect(DEFAULT_FEATURED_EVENT.paragraphs[0]).not.toBe("changed");
  });
});

describe("normaliseFeaturedEvent", () => {
  it("falls back to seed when raw is null", () => {
    expect(normaliseFeaturedEvent(null, DEFAULT_FEATURED_EVENT)).toEqual(
      DEFAULT_FEATURED_EVENT,
    );
  });

  it("falls back to seed per field when stored settings omit or garble them", () => {
    expect(
      normaliseFeaturedEvent(
        {
          enabled: "yes",
          title: "   ",
          paragraphs: "not a list",
          cta_url: 42,
        },
        DEFAULT_FEATURED_EVENT,
      ),
    ).toEqual(DEFAULT_FEATURED_EVENT);
  });

  it("keeps stored empty values instead of the seed", () => {
    expect(
      normaliseFeaturedEvent(
        {
          ...DEFAULT_FEATURED_EVENT,
          enabled: false,
          image_url: "",
          image_alt: "",
          paragraphs: [],
          cta_label: "",
        },
        DEFAULT_FEATURED_EVENT,
      ),
    ).toEqual({
      ...DEFAULT_FEATURED_EVENT,
      enabled: false,
      image_url: "",
      image_alt: "",
      paragraphs: [],
      cta_label: "",
    });
  });

  it("falls back to seed when a stored URL is unsafe", () => {
    expect(
      normaliseFeaturedEvent(
        {
          ...DEFAULT_FEATURED_EVENT,
          cta_url: "javascript:alert(1)",
        },
        DEFAULT_FEATURED_EVENT,
      ),
    ).toEqual(DEFAULT_FEATURED_EVENT);
  });
});

describe("parseFeaturedEvent", () => {
  let valid: FeaturedEvent;

  beforeEach(() => {
    valid = cloneFeaturedEvent(DEFAULT_FEATURED_EVENT);
  });

  it("parses, trims and drops empty paragraphs", () => {
    expect(
      parseFeaturedEvent({
        enabled: true,
        title: "  T.E.A.M  ",
        image_url: "  https://example.com/team.jpg  ",
        image_alt: "  Équipe  ",
        paragraphs: ["  Premier  ", "   ", "", 42, "Second"],
        cta_label: "  Mandat  ",
        cta_url: "  /competitions/team  ",
      }),
    ).toEqual({
      enabled: true,
      title: "T.E.A.M",
      image_url: "https://example.com/team.jpg",
      image_alt: "Équipe",
      paragraphs: ["Premier", "Second"],
      cta_label: "Mandat",
      cta_url: "/competitions/team",
    });
  });

  it("accepts empty image and CTA URLs", () => {
    valid.image_url = "";
    valid.cta_url = "";

    expect(parseFeaturedEvent(valid)).toEqual(valid);
  });

  it("accepts absolute http(s) CTA URLs", () => {
    valid.cta_url = "http://example.com/mandat.pdf";
    expect(parseFeaturedEvent(valid).cta_url).toBe(
      "http://example.com/mandat.pdf",
    );

    valid.cta_url = "https://example.com/mandat.pdf";
    expect(parseFeaturedEvent(valid).cta_url).toBe(
      "https://example.com/mandat.pdf",
    );
  });

  it("rejects an empty title", () => {
    valid.title = "   ";

    expect(() => {
      return parseFeaturedEvent(valid);
    }).toThrow();
  });

  it("rejects a non-boolean enabled flag", () => {
    expect(() => {
      return parseFeaturedEvent({ ...valid, enabled: "true" });
    }).toThrow();
  });

  it.each(UNSAFE_URLS)("rejects the CTA URL %s", (unsafeUrl) => {
    valid.cta_url = unsafeUrl;

    expect(() => {
      return parseFeaturedEvent(valid);
    }).toThrow("Le lien du bouton");
  });

  it.each([
    ...UNSAFE_URLS,
    "/images/team.jpg",
  ])("rejects the image URL %s", (unsafeUrl) => {
    valid.image_url = unsafeUrl;

    expect(() => {
      return parseFeaturedEvent(valid);
    }).toThrow("L'URL de l'image");
  });
});

describe("hasFeaturedEventDocumentFields", () => {
  it("requires every document field", () => {
    expect(hasFeaturedEventDocumentFields({ ...DEFAULT_FEATURED_EVENT })).toBe(
      true,
    );
    expect(
      hasFeaturedEventDocumentFields({
        enabled: true,
        title: "T.E.A.M",
      }),
    ).toBe(false);
  });
});
