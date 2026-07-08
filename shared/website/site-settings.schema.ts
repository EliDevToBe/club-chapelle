import { z } from "zod";
import { asNonEmptyString } from "~~/shared/utils/base-string.helper";

export type SiteSettingsSeed = {
  contact_email: string;
  club_address: string;
  instagram_url: string;
  facebook_url: string;
};

export type SiteSettings = SiteSettingsSeed;

const SITE_SETTINGS_FIELD_KEYS = [
  "contact_email",
  "club_address",
  "instagram_url",
  "facebook_url",
] as const satisfies ReadonlyArray<keyof SiteSettings>;

const socialUrlSchema = z.url();

export const siteSettingsSchema = z.object({
  contact_email: z.email(),
  club_address: z.string().min(1),
  instagram_url: socialUrlSchema,
  facebook_url: socialUrlSchema,
});

const prepareSiteSettingsRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  return {
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
