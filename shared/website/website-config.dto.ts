import type { WebsiteConfigKey } from "~~/shared/website/website-config.keys";

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
  label: string;
  url: string;
  preview_url: string;
  width: number;
  height: number;
  mtime: string | null;
};

export type HomepageCarouselSettingsDto = {
  data: HomepageCarouselItemDto[];
};

export type WebsiteGalleryImageDto = HomepageCarouselItemDto & {
  path: string;
};
