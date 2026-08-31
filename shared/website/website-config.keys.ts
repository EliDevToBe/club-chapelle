export const WEBSITE_CONFIG_KEYS = {
  homepageCarousel: "homepage_carousel",
  featureFlags: "feature_flags",
  siteSettings: "site_settings",
  openingHours: "opening_hours",
  homepageWelcome: "homepage_welcome",
  infosIntroduction: "infos_introduction",
  clubPhilosophy: "club_philosophy",
  tarifs: "tarifs",
} as const;

export const TEXT_SECTION_KEYS = {
  homepageWelcome: WEBSITE_CONFIG_KEYS.homepageWelcome,
  infosIntroduction: WEBSITE_CONFIG_KEYS.infosIntroduction,
  clubPhilosophy: WEBSITE_CONFIG_KEYS.clubPhilosophy,
} as const;

export type TextSectionKey =
  (typeof TEXT_SECTION_KEYS)[keyof typeof TEXT_SECTION_KEYS];

export const isTextSectionKey = (value: string): value is TextSectionKey => {
  return (
    value === TEXT_SECTION_KEYS.homepageWelcome ||
    value === TEXT_SECTION_KEYS.infosIntroduction ||
    value === TEXT_SECTION_KEYS.clubPhilosophy
  );
};

export const asTextSectionKey = (
  value: string | undefined,
): TextSectionKey | null => {
  if (value === undefined || !isTextSectionKey(value)) {
    return null;
  }

  return value;
};

export const textSectionPublicEndpoint = (
  sectionKey: TextSectionKey,
): string => {
  return `/api/website-config/text-sections/${sectionKey}`;
};

export const textSectionAdminEndpoint = (
  sectionKey: TextSectionKey,
): string => {
  return `/api/admin/website-config/text-sections/${sectionKey}`;
};

export const WEBSITE_CONFIG_API_ENDPOINTS = {
  homepageCarousel: "/api/admin/website-config/homepage-carousel",
  featureFlags: "/api/admin/website-config/feature-flags",
  siteSettings: "/api/admin/website-config/site-settings",
  openingHours: "/api/admin/website-config/opening-hours",
  tarifs: "/api/admin/website-config/tarifs",
} as const;

export const WEBSITE_CONFIG_PUBLIC_ENDPOINTS = {
  featureFlags: "/api/website-config/feature-flags",
  siteSettings: "/api/website-config/site-settings",
  openingHours: "/api/website-config/opening-hours",
  tarifs: "/api/website-config/tarifs",
} as const;

export type WebsiteConfigApiEndpoint =
  keyof typeof WEBSITE_CONFIG_API_ENDPOINTS;

export type WebsiteConfigKey =
  (typeof WEBSITE_CONFIG_KEYS)[keyof typeof WEBSITE_CONFIG_KEYS];
