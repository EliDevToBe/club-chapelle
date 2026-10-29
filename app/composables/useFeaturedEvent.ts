import {
  cloneFeaturedEvent,
  type FeaturedEvent,
} from "~~/shared/website/featured-event.schema";
import { DEFAULT_FEATURED_EVENT } from "~~/shared/website/featured-event.seed";
import type { FeaturedEventDto } from "~~/shared/website/website-config.dto";
import {
  WEBSITE_CONFIG_API_ENDPOINTS,
  WEBSITE_CONFIG_PUBLIC_ENDPOINTS,
} from "~~/shared/website/website-config.keys";

type FeaturedEventResponse = {
  settings: FeaturedEventDto;
};

export const useFeaturedEvent = async () => {
  const isSaving = ref(false);
  const seed = cloneFeaturedEvent(DEFAULT_FEATURED_EVENT);

  const { data, pending, error, refresh } =
    await useAsyncData<FeaturedEventResponse>("featured-event", async () => {
      return $fetch<FeaturedEventResponse>(
        WEBSITE_CONFIG_PUBLIC_ENDPOINTS.featuredEvent,
      );
    });

  const featuredEvent = computed((): FeaturedEvent => {
    return data.value?.settings ?? seed;
  });

  const saveFeaturedEvent = async (
    settings: FeaturedEventDto,
  ): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.featuredEvent, {
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
    featuredEvent,
    saveFeaturedEvent,
    isSaving,
    pending,
    error,
    refresh,
    seed,
  };
};
