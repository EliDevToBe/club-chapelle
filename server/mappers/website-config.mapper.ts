import type { WebsiteConfig } from "~~/domain/website/website-config";
import {
  asNonEmptyString,
  asNumber,
  asNumberOrZero,
} from "~~/shared/utils/base-string.helper";
import { normaliseFeatureFlags } from "~~/shared/website/feature-flags.schema";
import {
  normaliseSiteSettings,
  type SiteSettingsSeed,
} from "~~/shared/website/site-settings.schema";
import type {
  FeatureFlagsDto,
  HomepageCarouselItemDto,
  HomepageCarouselSettingsDto,
  SiteSettingsDto,
  WebsiteConfigDto,
} from "~~/shared/website/website-config.dto";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const toWebsiteConfigDto = (config: WebsiteConfig): WebsiteConfigDto => {
  return {
    key: config.key,
    settings: config.settings,
    created_at: config.createdAt.toISOString(),
    updated_at: config.updatedAt.toISOString(),
  };
};

export const toHomepageCarouselSettings = (
  settings: unknown,
): HomepageCarouselSettingsDto => {
  if (!isRecord(settings) || !Array.isArray(settings.data)) {
    return { data: [] };
  }

  const data: HomepageCarouselItemDto[] = settings.data
    .map((entry: unknown): HomepageCarouselItemDto | null => {
      if (!isRecord(entry)) {
        return null;
      }

      const label = asNonEmptyString(entry.label);
      const url = asNonEmptyString(entry.url);
      const previewUrl = asNonEmptyString(entry.preview_url);
      const width = asNumber(entry.width);
      const height = asNumber(entry.height);
      const mtime = asNonEmptyString(entry.mtime);
      const mimetype = asNonEmptyString(entry.mimetype);
      const size = asNumberOrZero(entry.size);

      if (
        !label ||
        !url ||
        !previewUrl ||
        width === null ||
        height === null ||
        !mimetype
      ) {
        return null;
      }

      return {
        label,
        url,
        preview_url: previewUrl,
        width,
        height,
        mtime,
        mimetype,
        size,
      };
    })
    .filter((entry): entry is HomepageCarouselItemDto => {
      return entry !== null;
    });

  return { data };
};

export const toFeatureFlagsSettings = (settings: unknown): FeatureFlagsDto => {
  return normaliseFeatureFlags(settings);
};

export const toSiteSettingsSettings = (
  settings: unknown,
  seed: SiteSettingsSeed,
): SiteSettingsDto => {
  return normaliseSiteSettings(settings, seed);
};
