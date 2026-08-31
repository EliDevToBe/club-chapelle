import type { SiteSettingsSeed } from "~~/shared/website/site-settings.schema";
import {
  DEFAULT_CLUB_ADDRESS,
  EMPTY_LEGAL_IDENTITY_SETTINGS,
} from "~~/shared/website/site-settings.seed";
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
    ...EMPTY_LEGAL_IDENTITY_SETTINGS,
  };
};

export const useSiteSettings = async () => {
  const isSaving = ref(false);
  const seed = buildClientSiteSettingsSeed();

  const { data, pending, error, refresh } =
    await useAsyncData<SiteSettingsResponse>("site-settings", async () => {
      return $fetch<SiteSettingsResponse>(
        WEBSITE_CONFIG_PUBLIC_ENDPOINTS.siteSettings,
      );
    });

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

  const saveSettings = async (
    patch: Partial<SiteSettingsDto>,
  ): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.siteSettings, {
        method: "PATCH",
        credentials: "include",
        body: {
          settings: patch,
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
