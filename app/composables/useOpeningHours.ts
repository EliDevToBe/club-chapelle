import {
  cloneOpeningHours,
  type OpeningHours,
} from "~~/shared/website/opening-hours.schema";
import { DEFAULT_OPENING_HOURS } from "~~/shared/website/opening-hours.seed";
import type { OpeningHoursDto } from "~~/shared/website/website-config.dto";
import {
  WEBSITE_CONFIG_API_ENDPOINTS,
  WEBSITE_CONFIG_PUBLIC_ENDPOINTS,
} from "~~/shared/website/website-config.keys";

type OpeningHoursResponse = {
  settings: OpeningHoursDto;
};

export const useOpeningHours = async () => {
  const isSaving = ref(false);
  const seed = cloneOpeningHours(DEFAULT_OPENING_HOURS);

  const { data, pending, error, refresh } = await useAsyncData<OpeningHoursResponse>(
    "opening-hours",
    async () => {
      return $fetch<OpeningHoursResponse>(
        WEBSITE_CONFIG_PUBLIC_ENDPOINTS.openingHours,
      );
    },
  );

  const openingHours = computed((): OpeningHours => {
    return data.value?.settings ?? seed;
  });

  const saveOpeningHours = async (settings: OpeningHoursDto): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.openingHours, {
        method: "PATCH",
        credentials: "include",
        body: {
          settings,
        },
      });

      await refresh();
    } finally {
      isSaving.value = false;
    }
  };

  return {
    openingHours,
    saveOpeningHours,
    isSaving,
    pending,
    error,
    refresh,
    seed,
  };
};
