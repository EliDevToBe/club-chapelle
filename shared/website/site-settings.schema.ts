import { z } from "zod";
import {
  asNonEmptyString,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

export type LegalIdentitySettings = {
  registered_office_address: string;
  publication_director: string;
  rna_number: string;
  siret: string;
  hosting_provider_name: string;
  hosting_provider_address: string;
  hosting_provider_phone: string;
};

export type ContactSiteSettings = {
  contact_email: string;
  club_address: string;
  instagram_url: string;
  facebook_url: string;
};

export type SiteSettingsSeed = ContactSiteSettings & LegalIdentitySettings;

export type SiteSettings = SiteSettingsSeed;

export const CONTACT_FIELD_KEYS = [
  "contact_email",
  "club_address",
  "instagram_url",
  "facebook_url",
] as const satisfies ReadonlyArray<keyof ContactSiteSettings>;

export const LEGAL_IDENTITY_FIELD_KEYS = [
  "registered_office_address",
  "publication_director",
  "rna_number",
  "siret",
  "hosting_provider_name",
  "hosting_provider_address",
  "hosting_provider_phone",
] as const satisfies ReadonlyArray<keyof LegalIdentitySettings>;

export const SITE_SETTINGS_FIELD_KEYS = [
  ...CONTACT_FIELD_KEYS,
  ...LEGAL_IDENTITY_FIELD_KEYS,
] as const satisfies ReadonlyArray<keyof SiteSettings>;

const socialUrlSchema = z.url();

export const contactSiteSettingsSchema = z.object({
  contact_email: z.email(),
  club_address: z.string().min(1),
  instagram_url: socialUrlSchema,
  facebook_url: socialUrlSchema,
});

export const legalIdentitySettingsSchema = z.object({
  registered_office_address: z.string(),
  publication_director: z.string(),
  rna_number: z.string(),
  siret: z.string(),
  hosting_provider_name: z.string(),
  hosting_provider_address: z.string(),
  hosting_provider_phone: z.string(),
});

export const siteSettingsSchema = z.object({
  ...contactSiteSettingsSchema.shape,
  ...legalIdentitySettingsSchema.shape,
});

const prepareSiteSettingsRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const prepared: Record<string, unknown> = {
    ...record,
    contact_email:
      typeof record.contact_email === "string"
        ? record.contact_email.trim().toLowerCase()
        : record.contact_email,
    club_address:
      typeof record.club_address === "string"
        ? record.club_address.trim()
        : record.club_address,
  };

  for (const key of LEGAL_IDENTITY_FIELD_KEYS) {
    prepared[key] = asTrimmedString(record[key]);
  }

  return prepared;
};

export const defaultSiteSettings = (seed: SiteSettingsSeed): SiteSettings => {
  return siteSettingsSchema.parse(prepareSiteSettingsRecord(seed));
};

export const normaliseSiteSettings = (
  raw: unknown,
  seed: SiteSettingsSeed,
): SiteSettings => {
  if (typeof raw !== "object" || raw === null) {
    return defaultSiteSettings(seed);
  }

  const record = raw as Record<string, unknown>;
  const merged: Record<string, unknown> = {};

  for (const key of SITE_SETTINGS_FIELD_KEYS) {
    const stored = asNonEmptyString(record[key]);
    merged[key] = stored ?? seed[key];
  }

  try {
    return siteSettingsSchema.parse(prepareSiteSettingsRecord(merged));
  } catch {
    return defaultSiteSettings(seed);
  }
};

export const parseSiteSettings = (raw: unknown): SiteSettings => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  return siteSettingsSchema.parse(prepareSiteSettingsRecord(record));
};

export const parseContactSiteSettings = (raw: unknown): ContactSiteSettings => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const prepared = prepareSiteSettingsRecord(record);

  return contactSiteSettingsSchema.parse({
    contact_email: prepared.contact_email,
    club_address: prepared.club_address,
    instagram_url: prepared.instagram_url,
    facebook_url: prepared.facebook_url,
  });
};

export const parseLegalIdentitySettings = (
  raw: unknown,
): LegalIdentitySettings => {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const prepared = prepareSiteSettingsRecord(record);

  return legalIdentitySettingsSchema.parse({
    registered_office_address: prepared.registered_office_address,
    publication_director: prepared.publication_director,
    rna_number: prepared.rna_number,
    siret: prepared.siret,
    hosting_provider_name: prepared.hosting_provider_name,
    hosting_provider_address: prepared.hosting_provider_address,
    hosting_provider_phone: prepared.hosting_provider_phone,
  });
};

export const hasSiteSettingsPatchFields = (
  patch: Record<string, unknown>,
): boolean => {
  return SITE_SETTINGS_FIELD_KEYS.some((key) => {
    return Object.hasOwn(patch, key);
  });
};

export const mergeSiteSettingsPatch = (
  current: SiteSettings,
  patch: Record<string, unknown>,
): SiteSettings => {
  const merged: Record<string, unknown> = { ...current };

  for (const key of SITE_SETTINGS_FIELD_KEYS) {
    if (Object.hasOwn(patch, key)) {
      merged[key] = patch[key];
    }
  }

  return parseSiteSettings(merged);
};
