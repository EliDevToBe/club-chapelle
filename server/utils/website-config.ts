import { createError } from "h3";
import { ZodError } from "zod";
import {
  toFeatureFlagsSettings,
  toHomepageCarouselSettings,
} from "~~/server/mappers/website-config.mapper";
import { formatZodValidationError } from "~~/shared/utils/format-zod-error";
import type { SiteSettingsSeed } from "~~/shared/website/site-settings.schema";
import { parseSiteSettings } from "~~/shared/website/site-settings.schema";

type HomepageCarouselPatchBody = {
  settings?: unknown;
};

type FeatureFlagsPatchBody = {
  settings?: unknown;
};

type SiteSettingsPatchBody = {
  settings?: unknown;
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
  seed: SiteSettingsSeed,
) => {
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body",
    });
  }

  try {
    return parseSiteSettings(body.settings ?? seed);
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: formatZodValidationError(error, "Invalid site settings"),
      });
    }

    throw error;
  }
};
