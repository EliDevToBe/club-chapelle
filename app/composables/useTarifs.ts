import { cloneTarifs, type Tarifs } from "~~/shared/website/tarifs.schema";
import { DEFAULT_TARIFS } from "~~/shared/website/tarifs.seed";
import type { TarifsDto } from "~~/shared/website/website-config.dto";
import {
  WEBSITE_CONFIG_API_ENDPOINTS,
  WEBSITE_CONFIG_PUBLIC_ENDPOINTS,
} from "~~/shared/website/website-config.keys";

type TarifsResponse = {
  settings: TarifsDto;
};

export const useTarifs = async () => {
  const isSaving = ref(false);
  const seed = cloneTarifs(DEFAULT_TARIFS);

  const { data, pending, error, refresh } = await useAsyncData<TarifsResponse>(
    "tarifs",
    async () => {
      return $fetch<TarifsResponse>(WEBSITE_CONFIG_PUBLIC_ENDPOINTS.tarifs);
    },
  );

  const tarifs = computed((): Tarifs => {
    return data.value?.settings ?? seed;
  });

  const saveTarifs = async (settings: TarifsDto): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(WEBSITE_CONFIG_API_ENDPOINTS.tarifs, {
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
    tarifs,
    saveTarifs,
    isSaving,
    pending,
    error,
    refresh,
    seed,
  };
};
