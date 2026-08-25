import { describe, expect, it } from "vitest";
import {
  defaultSiteSettings,
  mergeSiteSettingsPatch,
  normaliseSiteSettings,
  parseContactSiteSettings,
  parseLegalIdentitySettings,
  parseSiteSettings,
} from "~~/shared/website/site-settings.schema";
import { EMPTY_LEGAL_IDENTITY_SETTINGS } from "~~/shared/website/site-settings.seed";

const seed = {
  contact_email: "club@example.com",
  club_address: "Gymnase Tristan Tzara, 11 rue Tristan Tzara, 75018 PARIS",
  instagram_url: "https://www.instagram.com/les_archers_de_la_chapelle",
  facebook_url: "https://www.facebook.com/archersdelachapelle",
  ...EMPTY_LEGAL_IDENTITY_SETTINGS,
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

  it("merges stored legal identity fields with seed defaults", () => {
    expect(
      normaliseSiteSettings(
        {
          publication_director: "  Jane Doe ",
          rna_number: "W123456789",
        },
        seed,
      ),
    ).toEqual({
      ...seed,
      publication_director: "Jane Doe",
      rna_number: "W123456789",
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
      registered_office_address: "",
      publication_director: "",
      rna_number: "",
      siret: "",
      hosting_provider_name: "",
      hosting_provider_address: "",
      hosting_provider_phone: "",
    });
  });

  it("trims optional legal identity fields and allows them empty", () => {
    expect(
      parseSiteSettings({
        contact_email: "club@example.com",
        club_address: "11 rue Example",
        instagram_url: "https://www.instagram.com/example",
        facebook_url: "https://www.facebook.com/example",
        registered_office_address: "  1 rue du Siège, 75018 Paris  ",
        publication_director: "  Jane Doe  ",
        rna_number: "  W123456789  ",
        siret: "",
        hosting_provider_name: "  Example Host  ",
        hosting_provider_address: "  2 rue de l'Hébergeur  ",
        hosting_provider_phone: "  +33 1 00 00 00 00  ",
      }),
    ).toEqual({
      contact_email: "club@example.com",
      club_address: "11 rue Example",
      instagram_url: "https://www.instagram.com/example",
      facebook_url: "https://www.facebook.com/example",
      registered_office_address: "1 rue du Siège, 75018 Paris",
      publication_director: "Jane Doe",
      rna_number: "W123456789",
      siret: "",
      hosting_provider_name: "Example Host",
      hosting_provider_address: "2 rue de l'Hébergeur",
      hosting_provider_phone: "+33 1 00 00 00 00",
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

describe("parseContactSiteSettings", () => {
  it("parses contact fields without requiring legal identity", () => {
    expect(
      parseContactSiteSettings({
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
});

describe("parseLegalIdentitySettings", () => {
  it("parses legal identity fields without requiring contact settings", () => {
    expect(
      parseLegalIdentitySettings({
        registered_office_address: "  1 rue du Siège  ",
        publication_director: "  Jane Doe  ",
        rna_number: "W123456789",
        siret: "",
        hosting_provider_name: "Example Host",
        hosting_provider_address: "2 rue de l'Hébergeur",
        hosting_provider_phone: "+33 1 00 00 00 00",
      }),
    ).toEqual({
      registered_office_address: "1 rue du Siège",
      publication_director: "Jane Doe",
      rna_number: "W123456789",
      siret: "",
      hosting_provider_name: "Example Host",
      hosting_provider_address: "2 rue de l'Hébergeur",
      hosting_provider_phone: "+33 1 00 00 00 00",
    });
  });
});

describe("mergeSiteSettingsPatch", () => {
  it("applies a contact patch without wiping stored legal identity", () => {
    const current = {
      ...seed,
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    };

    expect(
      mergeSiteSettingsPatch(current, {
        contact_email: "new@example.com",
        club_address: "Autre gymnase",
        instagram_url: "https://www.instagram.com/new",
        facebook_url: "https://www.facebook.com/new",
      }),
    ).toEqual({
      ...current,
      contact_email: "new@example.com",
      club_address: "Autre gymnase",
      instagram_url: "https://www.instagram.com/new",
      facebook_url: "https://www.facebook.com/new",
    });
  });

  it("applies a legal identity patch without wiping stored contact settings", () => {
    const current = {
      ...seed,
      contact_email: "admin@example.com",
    };

    expect(
      mergeSiteSettingsPatch(current, {
        publication_director: "  Jane Doe  ",
        rna_number: "W123456789",
      }),
    ).toEqual({
      ...current,
      publication_director: "Jane Doe",
      rna_number: "W123456789",
    });
  });

  it("ignores unknown patch keys", () => {
    expect(
      mergeSiteSettingsPatch(seed, {
        unknown_field: "nope",
        club_address: "Autre gymnase",
      }),
    ).toEqual({
      ...seed,
      club_address: "Autre gymnase",
    });
  });
});
