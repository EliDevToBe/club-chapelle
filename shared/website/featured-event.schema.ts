import { z } from "zod";
import {
  asNonEmptyString,
  asTrimmedString,
} from "~~/shared/utils/base-string.helper";

export type FeaturedEvent = {
  enabled: boolean;
  title: string;
  image_url: string;
  image_alt: string;
  paragraphs: string[];
  cta_label: string;
  cta_url: string;
};

export const FEATURED_EVENT_FIELD_KEYS = [
  "enabled",
  "title",
  "image_url",
  "image_alt",
  "paragraphs",
  "cta_label",
  "cta_url",
] as const satisfies ReadonlyArray<keyof FeaturedEvent>;

// Matches exactly the URL scheme names "http" or "https" (without the colon).
const HTTP_PROTOCOL_PATTERN = /^https?$/;

// Matches a site-relative path: a single leading "/" not followed by "/" or "\"
// (both would make it protocol-relative in browsers), with no whitespace or
// backslashes anywhere.
const SITE_RELATIVE_PATH_PATTERN = /^\/(?![/\\])[^\s\\]*$/;

const IMAGE_URL_ERROR =
  "L'URL de l'image doit commencer par https:// ou http://";

const CTA_URL_ERROR =
  "Le lien du bouton doit commencer par https://, http:// ou / (chemin du site)";

/**
 * Both URLs end up in `href` / `src` attributes, so only `http:` / `https:`
 * absolute URLs (and, for the CTA, site-relative paths) are accepted: no
 * `javascript:`, `data:`, protocol-relative `//host`, or any other scheme.
 * The message is repeated on each option because Zod reports the closest
 * option's issue rather than the union's when only one option is a string
 * format check.
 */
export const featuredEventImageUrlSchema = z.union(
  [
    z.literal("", { error: IMAGE_URL_ERROR }),
    z.url({ protocol: HTTP_PROTOCOL_PATTERN, error: IMAGE_URL_ERROR }),
  ],
  { error: IMAGE_URL_ERROR },
);

export const featuredEventCtaUrlSchema = z.union(
  [
    z.literal("", { error: CTA_URL_ERROR }),
    z.url({ protocol: HTTP_PROTOCOL_PATTERN, error: CTA_URL_ERROR }),
    z.string().regex(SITE_RELATIVE_PATH_PATTERN, { error: CTA_URL_ERROR }),
  ],
  { error: CTA_URL_ERROR },
);

export const featuredEventSchema = z.object({
  enabled: z.boolean({ error: "L'état d'affichage est invalide" }),
  title: z.string().min(1, "Le titre est requis"),
  image_url: featuredEventImageUrlSchema,
  image_alt: z.string(),
  paragraphs: z.array(z.string().min(1, "Un paragraphe ne peut être vide")),
  cta_label: z.string(),
  cta_url: featuredEventCtaUrlSchema,
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const prepareParagraphs = (raw: unknown[]): string[] => {
  const paragraphs: string[] = [];
  for (const entry of raw) {
    const paragraph = asNonEmptyString(entry);
    if (paragraph !== null) {
      paragraphs.push(paragraph);
    }
  }

  return paragraphs;
};

const prepareFeaturedEventRecord = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const paragraphsRaw = record.paragraphs;

  return {
    enabled: record.enabled,
    title: asTrimmedString(record.title),
    image_url: asTrimmedString(record.image_url),
    image_alt: asTrimmedString(record.image_alt),
    paragraphs: Array.isArray(paragraphsRaw)
      ? prepareParagraphs(paragraphsRaw)
      : [],
    cta_label: asTrimmedString(record.cta_label),
    cta_url: asTrimmedString(record.cta_url),
  };
};

export const defaultFeaturedEvent = (seed: FeaturedEvent): FeaturedEvent => {
  return featuredEventSchema.parse(prepareFeaturedEventRecord(seed));
};

export const cloneFeaturedEvent = (value: FeaturedEvent): FeaturedEvent => {
  return {
    enabled: value.enabled,
    title: value.title,
    image_url: value.image_url,
    image_alt: value.image_alt,
    paragraphs: [...value.paragraphs],
    cta_label: value.cta_label,
    cta_url: value.cta_url,
  };
};

const stringOrSeed = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
};

export const normaliseFeaturedEvent = (
  raw: unknown,
  seed: FeaturedEvent,
): FeaturedEvent => {
  if (!isRecord(raw)) {
    return defaultFeaturedEvent(seed);
  }

  const paragraphsRaw = raw.paragraphs;
  const merged: Record<string, unknown> = {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : seed.enabled,
    title: asNonEmptyString(raw.title) ?? seed.title,
    image_url: stringOrSeed(raw.image_url, seed.image_url),
    image_alt: stringOrSeed(raw.image_alt, seed.image_alt),
    paragraphs: Array.isArray(paragraphsRaw)
      ? prepareParagraphs(paragraphsRaw)
      : seed.paragraphs,
    cta_label: stringOrSeed(raw.cta_label, seed.cta_label),
    cta_url: stringOrSeed(raw.cta_url, seed.cta_url),
  };

  try {
    return featuredEventSchema.parse(merged);
  } catch {
    return defaultFeaturedEvent(seed);
  }
};

export const parseFeaturedEvent = (raw: unknown): FeaturedEvent => {
  const record = isRecord(raw) ? raw : {};

  return featuredEventSchema.parse(prepareFeaturedEventRecord(record));
};

export const hasFeaturedEventDocumentFields = (
  patch: Record<string, unknown>,
): boolean => {
  return FEATURED_EVENT_FIELD_KEYS.every((key) => {
    return Object.hasOwn(patch, key);
  });
};
