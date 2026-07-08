import type { SiteSettingsSeed } from "~~/shared/website/site-settings.schema";
import { DEFAULT_CLUB_ADDRESS } from "~~/shared/website/site-settings.seed";
import type { SiteSettingsDto } from "~~/shared/website/website-config.dto";
import {
  WEBSITE_CONFIG_API_ENDPOINTS,
  WEBSITE_CONFIG_PUBLIC_ENDPOINTS,
} from "~~/shared/website/website-config.keys";

type SiteSettingsResponse = {
  settings: SiteSettingsDto;
};

const buildClientSiteSettingsSeed = (): SiteSettingsSeed => {
  const config = useRuntimeConfig();

  return {
    contact_email: config.public.defaultContactEmail,
    club_address: DEFAULT_CLUB_ADDRESS,
    instagram_url: config.public.socialInstagram,
    facebook_url: config.public.socialFacebook,
  };
};

export const useSiteSettings = () => {
  const isSaving = ref(false);
  const seed = buildClientSiteSettingsSeed();

  const { data, pending, error, refresh } = useAsyncData<SiteSettingsResponse>(
    "site-settings",
    async () => {
      return $fetch(WEBSITE_CONFIG_PUBLIC_ENDPOINTS.siteSettings);
    },
    {
      default: () => {
        return {
          settings: {
            contact_email: seed.contact_email,
            club_address: seed.club_address,
            instagram_url: seed.instagram_url,
            facebook_url: seed.facebook_url,
          },
        };
      },
    },
  );

  const settings = computed(() => {
    return data.value?.settings ?? seed;
  });

  const contactEmail = computed(() => {
    return settings.value.contact_email;
  });

  const clubAddress = computed(() => {
    return settings.value.club_address;
  });

  const instagramUrl = computed(() => {
    return settings.value.instagram_url;
  });

  const facebookUrl = computed(() => {
    return settings.value.facebook_url;
  });

  const saveSettings = async (nextSettings: SiteSettingsDto): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.siteSettings, {
        method: "PATCH",
        credentials: "include",
        body: {
          settings: nextSettings,
        },
      });

      await refresh();
    } finally {
      isSaving.value = false;
    }
  };

  return {
    settings,
    contactEmail,
    clubAddress,
    instagramUrl,
    facebookUrl,
    saveSettings,
    isSaving,
    pending,
    error,
    refresh,
    seed,
  };
};
