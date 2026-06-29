import { describe, expect, it } from "vitest";
import {
  parseFeatureFlagsPatchBody,
  parseHomepageCarouselPatchBody,
} from "~~/server/utils/website-config";
import { defaultFeatureFlags } from "~~/shared/website/feature-flags.schema";

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
