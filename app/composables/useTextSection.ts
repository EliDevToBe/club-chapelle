import {
  cloneTextSection,
  type TextSection,
} from "~~/shared/website/text-section.schema";
import { getTextSectionSeed } from "~~/shared/website/text-section.seed";
import type { TextSectionDto } from "~~/shared/website/website-config.dto";
import {
  type TextSectionKey,
  textSectionAdminEndpoint,
  textSectionPublicEndpoint,
} from "~~/shared/website/website-config.keys";

type TextSectionResponse = {
  settings: TextSectionDto;
};

export const useTextSection = async (sectionKey: TextSectionKey) => {
  const isSaving = ref(false);
  const seed = cloneTextSection(getTextSectionSeed(sectionKey));

  const { data, pending, error, refresh } =
    await useAsyncData<TextSectionResponse>(
      `text-section-${sectionKey}`,
      async () => {
        return $fetch<TextSectionResponse>(
          textSectionPublicEndpoint(sectionKey),
        );
      },
    );

  const textSection = computed((): TextSection => {
    return data.value?.settings ?? seed;
  });

  const saveTextSection = async (settings: TextSectionDto): Promise<void> => {
    isSaving.value = true;

    try {
      await $fetch(textSectionAdminEndpoint(sectionKey), {
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
    textSection,
    saveTextSection,
    isSaving,
    pending,
    error,
    refresh,
    seed,
  };
};
