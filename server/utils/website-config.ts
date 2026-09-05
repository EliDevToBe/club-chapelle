import { getRouterParam, type H3Event } from "h3";
import { ZodError } from "zod";
import {
  toFeatureFlagsSettings,
  toHomepageCarouselSettings,
} from "~~/server/mappers/website-config.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
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
    throw ApiError(API_ERROR_REASON.website.invalid_text_section);
  }

  return sectionKey;
};

export const parseHomepageCarouselPatchBody = (
  body: HomepageCarouselPatchBody | null | undefined,
) => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  return toHomepageCarouselSettings(body.settings);
};

export const parseFeatureFlagsPatchBody = (
  body: FeatureFlagsPatchBody | null | undefined,
) => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  return toFeatureFlagsSettings(body.settings);
};

export const parseSiteSettingsPatchBody = (
  body: SiteSettingsPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw ApiError(API_ERROR_REASON.website.invalid_site_settings);
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasSiteSettingsPatchFields(patch)) {
    throw ApiError(API_ERROR_REASON.website.invalid_site_settings);
  }

  return patch;
};

export const mapSiteSettingsPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw ApiError(API_ERROR_REASON.website.invalid_site_settings);
  }

  throw error;
};

export const parseOpeningHoursPatchBody = (
  body: OpeningHoursPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw ApiError(API_ERROR_REASON.website.invalid_opening_hours);
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasOpeningHoursDocumentFields(patch)) {
    throw ApiError(API_ERROR_REASON.website.invalid_opening_hours);
  }

  return patch;
};

export const mapOpeningHoursPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw ApiError(API_ERROR_REASON.website.invalid_opening_hours);
  }

  throw error;
};

export const parseTextSectionPatchBody = (
  body: TextSectionPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw ApiError(API_ERROR_REASON.website.invalid_text_section);
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasTextSectionDocumentFields(patch)) {
    throw ApiError(API_ERROR_REASON.website.invalid_text_section);
  }

  return patch;
};

export const mapTextSectionPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw ApiError(API_ERROR_REASON.website.invalid_text_section);
  }

  throw error;
};

export const parseTarifsPatchBody = (
  body: TarifsPatchBody | null | undefined,
): Record<string, unknown> => {
  if (!body || typeof body !== "object") {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  if (typeof body.settings !== "object" || body.settings === null) {
    throw ApiError(API_ERROR_REASON.website.invalid_tarifs);
  }

  const patch = body.settings as Record<string, unknown>;
  if (!hasTarifsDocumentFields(patch)) {
    throw ApiError(API_ERROR_REASON.website.invalid_tarifs);
  }

  return patch;
};

export const mapTarifsPatchError = (error: unknown): never => {
  if (error instanceof ZodError) {
    throw ApiError(API_ERROR_REASON.website.invalid_tarifs);
  }

  throw error;
};
