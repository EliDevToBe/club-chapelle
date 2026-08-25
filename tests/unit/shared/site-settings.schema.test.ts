import { describe, expect, it } from "vitest";
import {
  defaultSiteSettings,
  normaliseSiteSettings,
  parseSiteSettings,
} from "~~/shared/website/site-settings.schema";

const seed = {
  contact_email: "club@example.com",
  club_address: "Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS",
  instagram_url: "https://www.instagram.com/les_archers_de_la_chapelle",
  facebook_url: "https://www.facebook.com/archersdelachapelle",
};

describe("defaultSiteSettings", () => {
  it("returns seed values with normalised email", () => {
    expect(defaultSiteSettings(seed)).toEqual(seed);
  });
});

describe("normaliseSiteSettings", () => {
  it("falls back to seed when raw is null", () => {
    expect(normaliseSiteSettings(null, seed)).toEqual(seed);
  });

  it("merges partial stored values with seed defaults", () => {
    expect(
      normaliseSiteSettings(
        {
          contact_email: "  Club@Example.com ",
        },
        seed,
      ),
    ).toEqual({
      ...seed,
      contact_email: "club@example.com",
    });
  });

  it("falls back to seed when stored values are invalid", () => {
    expect(
      normaliseSiteSettings(
        {
          contact_email: "not-an-email",
          instagram_url: "not-a-url",
        },
        seed,
      ),
    ).toEqual(seed);
  });
});

describe("parseSiteSettings", () => {
  it("parses and normalises valid settings", () => {
    expect(
      parseSiteSettings({
        contact_email: "  Club@Example.com ",
        club_address: " 11 rue Example ",
        instagram_url: "https://www.instagram.com/example",
        facebook_url: "https://www.facebook.com/example",
      }),
    ).toEqual({
      contact_email: "club@example.com",
      club_address: "11 rue Example",
      instagram_url: "https://www.instagram.com/example",
      facebook_url: "https://www.facebook.com/example",
    });
  });

  it("rejects invalid email", () => {
    expect(() => {
      return parseSiteSettings({
        contact_email: "invalid",
        club_address: "11 rue Example",
        instagram_url: "https://www.instagram.com/example",
        facebook_url: "https://www.facebook.com/example",
      });
    }).toThrow();
  });

  it("rejects invalid social URLs", () => {
    expect(() => {
      return parseSiteSettings({
        contact_email: "club@example.com",
        club_address: "11 rue Example",
        instagram_url: "instagram.com/example",
        facebook_url: "https://www.facebook.com/example",
      });
    }).toThrow();
  });
});
