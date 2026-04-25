export const WEBSITE_CONFIG_KEYS = {
  homepageCarousel: "homepage_carousel",
} as const;

export const WEBSITE_CONFIG_API_ENDPOINTS = {
  homepageCarousel: "/api/admin/website-config/homepage-carousel",
} as const;

export type WebsiteConfigApiEndpoint =
  keyof typeof WEBSITE_CONFIG_API_ENDPOINTS;

export type WebsiteConfigKey =
  (typeof WEBSITE_CONFIG_KEYS)[keyof typeof WEBSITE_CONFIG_KEYS];
