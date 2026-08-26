import { describe, expect, it } from "vitest";
import {
  parseFeatureFlagsPatchBody,
  parseHomepageCarouselPatchBody,
  parseOpeningHoursPatchBody,
  parseSiteSettingsPatchBody,
} from "~~/server/utils/website-config";
import { defaultFeatureFlags } from "~~/shared/website/feature-flags.schema";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";

describe("parseHomepageCarouselPatchBody", () => {
  it("rejects empty payloads", () => {
    expect(() => parseHomepageCarouselPatchBody(null)).toThrowError(
      "Invalid request body",
    );
  });

  it("normalises malformed settings to an empty list", () => {
    expect(
      parseHomepageCarouselPatchBody({
        settings: { data: [{ label: "No URL" }] },
      }),
    ).toEqual({ data: [] });
  });

  it("keeps valid carousel entries", () => {
    expect(
      parseHomepageCarouselPatchBody({
        settings: {
          data: [
            {
              label: "Drapeau",
              url: "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg",
              preview_url:
                "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg?w=240&h=160",
              width: 240,
              height: 160,
              size: 204_800,
              mtime: "2026-01-01T00:00:00.000Z",
              mimetype: "image/jpeg",
            },
          ],
        },
      }),
    ).toEqual({
      data: [
        {
          label: "Drapeau",
          url: "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg",
          preview_url:
            "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg?w=240&h=160",
          width: 240,
          height: 160,
          size: 204_800,
          mtime: "2026-01-01T00:00:00.000Z",
          mimetype: "image/jpeg",
        },
      ],
    });
  });

  it("defaults missing size to zero", () => {
    expect(
      parseHomepageCarouselPatchBody({
        settings: {
          data: [
            {
              label: "Drapeau",
              url: "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg",
              preview_url:
                "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg?w=240&h=160",
              width: 240,
              height: 160,
              mtime: "2026-01-01T00:00:00.000Z",
              mimetype: "image/jpeg",
            },
          ],
        },
      }),
    ).toEqual({
      data: [
        {
          label: "Drapeau",
          url: "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg",
          preview_url:
            "https://archers-chapelle.sirv.com/chapelle/drapeau.jpg?w=240&h=160",
          width: 240,
          height: 160,
          size: 0,
          mtime: "2026-01-01T00:00:00.000Z",
          mimetype: "image/jpeg",
        },
      ],
    });
  });
});

describe("parseFeatureFlagsPatchBody", () => {
  it("rejects empty payloads", () => {
    expect(() => parseFeatureFlagsPatchBody(null)).toThrowError(
      "Invalid request body",
    );
  });

  it("normalises missing settings to defaults", () => {
    expect(parseFeatureFlagsPatchBody({ settings: undefined })).toEqual(
      defaultFeatureFlags(),
    );
  });

  it("strips unknown keys from patch payloads", () => {
    expect(
      parseFeatureFlagsPatchBody({
        settings: {
          unknown_flag: true,
        },
      }),
    ).toEqual(defaultFeatureFlags());
  });
});

describe("parseSiteSettingsPatchBody", () => {
  it("rejects empty payloads", () => {
    expect(() => {
      return parseSiteSettingsPatchBody(null);
    }).toThrowError("Invalid request body");
  });

  it("rejects a missing settings object", () => {
    expect(() => {
      return parseSiteSettingsPatchBody({ settings: undefined });
    }).toThrowError("Invalid site settings");
  });

  it("rejects a patch with no known site-settings fields", () => {
    expect(() => {
      return parseSiteSettingsPatchBody({
        settings: { unknown_field: true },
      });
    }).toThrowError("Invalid site settings");
  });

  it("returns a contact-only patch without filling legal identity", () => {
    expect(
      parseSiteSettingsPatchBody({
        settings: {
          contact_email: "club@example.com",
          club_address: "11 rue Example, 75018 Paris",
          instagram_url: "https://www.instagram.com/example",
          facebook_url: "https://www.facebook.com/example",
        },
      }),
    ).toEqual({
      contact_email: "club@example.com",
      club_address: "11 rue Example, 75018 Paris",
      instagram_url: "https://www.instagram.com/example",
      facebook_url: "https://www.facebook.com/example",
    });
  });

  it("returns a legal-identity-only patch", () => {
    expect(
      parseSiteSettingsPatchBody({
        settings: {
          publication_director: "Jane Doe",
          rna_number: "W123456789",
        },
      }),
    ).toEqual({
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    });
  });
});

describe("parseOpeningHoursPatchBody", () => {
  it("rejects empty payloads", () => {
    expect(() => {
      return parseOpeningHoursPatchBody(null);
    }).toThrowError("Invalid request body");
  });

  it("rejects a missing settings object", () => {
    expect(() => {
      return parseOpeningHoursPatchBody({ settings: undefined });
    }).toThrowError("Invalid opening hours");
  });

  it("rejects a patch missing document fields", () => {
    expect(() => {
      return parseOpeningHoursPatchBody({
        settings: { intro: "Intro only" },
      });
    }).toThrowError("Invalid opening hours");
  });

  it("returns a full opening-hours document", () => {
    expect(
      parseOpeningHoursPatchBody({
        settings: DEFAULT_OPENING_HOURS,
      }),
    ).toEqual(DEFAULT_OPENING_HOURS);
  });
});
