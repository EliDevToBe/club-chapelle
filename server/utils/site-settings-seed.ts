import type { H3Event } from "h3";
import type { SiteSettingsSeed } from "~~/shared/website/site-settings.schema";
import { DEFAULT_CLUB_ADDRESS } from "~~/shared/website/site-settings.seed";

export const buildSiteSettingsSeed = (event: H3Event): SiteSettingsSeed => {
  const config = useRuntimeConfig(event);

  return {
    contact_email: config.public.defaultContactEmail,
    club_address: DEFAULT_CLUB_ADDRESS,
    instagram_url: config.public.socialInstagram,
    facebook_url: config.public.socialFacebook,
  };
};
