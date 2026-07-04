import type {
  FeatureFlagKey,
  FeatureFlags,
} from "~~/shared/website/feature-flags.schema";
import { defaultFeatureFlags } from "~~/shared/website/feature-flags.schema";
import {
  WEBSITE_CONFIG_API_ENDPOINTS,
  WEBSITE_CONFIG_PUBLIC_ENDPOINTS,
} from "~~/shared/website/website-config.keys";

type FeatureFlagsResponse = {
  settings: FeatureFlags;
};

export const useFeatureFlags = () => {
  const isSaving = ref(false);

  const { data, pending, error, refresh } = useAsyncData<FeatureFlagsResponse>(
    "feature-flags",
    async () => {
      return $fetch(WEBSITE_CONFIG_PUBLIC_ENDPOINTS.featureFlags);
    },
    {
      server: false,
      default: () => {
        return { settings: defaultFeatureFlags() };
      },
    },
  );

  const flags = computed(() => {
    return data.value?.settings ?? defaultFeatureFlags();
  });

  const isEnabled = (key: FeatureFlagKey) => {
    return computed(() => {
      return flags.value[key] ?? false;
    });
  };

  const updateFlag = async (
    key: FeatureFlagKey,
    value: boolean,
  ): Promise<void> => {
    isSaving.value = true;

    try {
      const nextSettings = {
        ...flags.value,
        [key]: value,
      };

      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.featureFlags, {
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
    flags,
    isEnabled,
    updateFlag,
    isSaving,
    pending,
    error,
    refresh,
  };
};
