import type { FeatureFlags } from "~~/shared/website/feature-flags.schema";
import type { OpeningHours } from "~~/shared/website/opening-hours.schema";
import type { SiteSettings } from "~~/shared/website/site-settings.schema";
import type { WebsiteConfigKey } from "~~/shared/website/website-config.keys";

export type FeatureFlagsDto = FeatureFlags;

export type SiteSettingsDto = SiteSettings;

export type OpeningHoursDto = OpeningHours;

export type WebsiteConfigDto = {
  key: string;
  settings: unknown;
  created_at: string;
  updated_at: string;
};

export type WebsiteConfigUpdateDto = {
  key: WebsiteConfigKey;
  settings: unknown;
};

export type HomepageCarouselItemDto = {
  size: number;
  label: string;
  url: string;
  preview_url: string;
  width: number;
  height: number;
  mtime: string | null;
  mimetype: string;
};

export type HomepageCarouselSettingsDto = {
  data: HomepageCarouselItemDto[];
};

export type WebsiteGalleryImageDto = HomepageCarouselItemDto & {
  path: string;
};

export type WebsiteGalleryInfos = {
  allowance: number;
  used: number;
  files: number;
  burstable?: number;
};

export type WebsiteGalleryUploadItemResultDto = {
  filename: string;
  success: boolean;
  image: WebsiteGalleryImageDto | null;
  error?: string;
};

export type WebsiteGalleryDeleteItemResultDto = {
  path: string;
  success: boolean;
  error?: string;
};
