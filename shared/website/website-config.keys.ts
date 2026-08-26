export const WEBSITE_CONFIG_KEYS = {
  homepageCarousel: "homepage_carousel",
  featureFlags: "feature_flags",
  siteSettings: "site_settings",
  openingHours: "opening_hours",
} as const;

export const WEBSITE_CONFIG_API_ENDPOINTS = {
  homepageCarousel: "/api/admin/website-config/homepage-carousel",
  featureFlags: "/api/admin/website-config/feature-flags",
  siteSettings: "/api/admin/website-config/site-settings",
  openingHours: "/api/admin/website-config/opening-hours",
} as const;

export const WEBSITE_CONFIG_PUBLIC_ENDPOINTS = {
  featureFlags: "/api/website-config/feature-flags",
  siteSettings: "/api/website-config/site-settings",
  openingHours: "/api/website-config/opening-hours",
} as const;

export type WebsiteConfigApiEndpoint =
  keyof typeof WEBSITE_CONFIG_API_ENDPOINTS;

export type WebsiteConfigKey =
  (typeof WEBSITE_CONFIG_KEYS)[keyof typeof WEBSITE_CONFIG_KEYS];
