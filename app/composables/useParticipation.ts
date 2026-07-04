import type {
  ParticipationCreateDto,
  ParticipationDto,
  ParticipationUpdateDto,
} from "~~/shared/participation/participation.dto";

export const useParticipation = () => {
  const isMutating = ref(false);

  const list = async (): Promise<ParticipationDto[]> => {
    const response = await $fetch<{ participations: ParticipationDto[] }>(
      "/api/participations",
      {
        credentials: "include",
      },
    );

    return response.participations;
  };

  const findById = async (id: string): Promise<ParticipationDto> => {
    const response = await $fetch<{ participation: ParticipationDto }>(
      `/api/participations/${id}`,
      {
        credentials: "include",
      },
    );

    return response.participation;
  };

  const create = async (
    body: ParticipationCreateDto,
  ): Promise<ParticipationDto> => {
    isMutating.value = true;
    try {
      const response = await $fetch<{ participation: ParticipationDto }>(
        "/api/participations",
        {
          method: "POST",
          credentials: "include",
          body,
        },
      );

      return response.participation;
    } finally {
      isMutating.value = false;
    }
  };

  const update = async (
    id: string,
    body: ParticipationUpdateDto,
  ): Promise<ParticipationDto> => {
    isMutating.value = true;
    try {
      const response = await $fetch<{ participation: ParticipationDto }>(
        `/api/participations/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          body,
        },
      );

      return response.participation;
    } finally {
      isMutating.value = false;
    }
  };

  const remove = async (id: string): Promise<void> => {
    isMutating.value = true;
    try {
      await $fetch(`/api/participations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } finally {
      isMutating.value = false;
    }
  };

  return {
    list,
    findById,
    create,
    update,
    remove,
    isMutating,
  };
};
