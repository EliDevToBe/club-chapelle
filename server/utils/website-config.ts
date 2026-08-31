import { createError, type H3Event } from "h3";
import { ZodError } from "zod";
import {
  toFeatureFlagsSettings,
  toHomepageCarouselSettings,
} from "~~/server/mappers/website-config.mapper";
import { formatZodValidationError } from "~~/shared/utils/format-zod-error";
import { hasOpeningHoursDocumentFields } from "~~/shared/website/opening-hours.schema";
import { hasSiteSettingsPatchFields } from "~~/shared/website/site-settings.schema";
import { hasTarifsDocumentFields } from "~~/shared/website/tarifs.schema";
import { hasTextSectionDocumentFields } from "~~/shared/website/text-section.schema";
import {
  asTextSectionKey,
  type TextSectionKey,
} from "~~/shared/website/website-config.keys";

type HomepageCarouselPatchBody = {
  settings?: unknown;
};

type FeatureFlagsPatchBody = {
  settings?: unknown;
};

type SiteSettingsPatchBody = {
  settings?: unknown;
};

type OpeningHoursPatchBody = {
  settings?: unknown;
};

type TextSectionPatchBody = {
  settings?: unknown;
};

type TarifsPatchBody = {
  settings?: unknown;
};

export const requireTextSectionKey = (event: H3Event): TextSectionKey => {
  const sectionKey = asTextSectionKey(getRouterParam(event, "sectionKey"));
  if (!sectionKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid text section",
    });
  }

  return sectionKey;
};

export const parseHomepageCarouselPatchBody = (
  body: HomepageCarouselPatchBody | null | undefined,
) => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  return toHomepageCarouselSettings(body.settings);
};

export const parseFeatureFlagsPatchBody = (
  body: FeatureFlagsPatchBody | null | undefined,
) => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  return toFeatureFlagsSettings(body.settings);
};

export const parseSiteSettingsPatchBody = (
  body: SiteSettingsPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid site settings",
    });
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasSiteSettingsPatchFields(patch)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid site settings",
    });
  }

  return patch;
};

export const mapSiteSettingsPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(error, "Invalid site settings"),
    });
  }

  throw error;
};

export const parseOpeningHoursPatchBody = (
  body: OpeningHoursPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid opening hours",
    });
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasOpeningHoursDocumentFields(patch)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid opening hours",
    });
  }

  return patch;
};

export const mapOpeningHoursPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(error, "Invalid opening hours"),
    });
  }

  throw error;
};

export const parseTextSectionPatchBody = (
  body: TextSectionPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid text section",
    });
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasTextSectionDocumentFields(patch)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid text section",
    });
  }

  return patch;
};

export const mapTextSectionPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(error, "Invalid text section"),
    });
  }

  throw error;
};

export const parseTarifsPatchBody = (
  body: TarifsPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid tarifs",
    });
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasTarifsDocumentFields(patch)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid tarifs",
    });
  }

  return patch;
};

export const mapTarifsPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(error, "Invalid tarifs"),
    });
  }

  throw error;
};
