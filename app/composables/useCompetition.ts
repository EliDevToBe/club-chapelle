import type {
  CompetitionCreateDto,
  CompetitionDto,
} from "~~/shared/competitions/competition.dto";

export const useCompetition = () => {
  const isMutating = ref(false);

  const create = async (
    body: CompetitionCreateDto,
  ): Promise<CompetitionDto> => {
    isMutating.value = true;
    try {
      const response = await $fetch<{ competition: CompetitionDto }>(
        "/api/competitions",
        {
          method: "POST",
          credentials: "include",
          body,
        },
      );

      return response.competition;
    } finally {
      isMutating.value = false;
    }
  };

  return {
    create,
    isMutating,
  };
};
