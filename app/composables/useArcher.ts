import type { ArcherCreateDto, ArcherDto } from "~~/shared/archer/archer.dto";
import type {
  ArcherListQueryDto,
  ArcherListResponseDto,
} from "~~/shared/archer/archer-list.dto";

export const useArcher = () => {
  const listPage = async (
    query: Required<Pick<ArcherListQueryDto, "limit" | "offset">> &
      Pick<ArcherListQueryDto, "search">,
    signal?: AbortSignal,
  ): Promise<ArcherListResponseDto> => {
    return $fetch<ArcherListResponseDto>("/api/archers", {
      credentials: "include",
      query: {
        limit: query.limit,
        offset: query.offset,
        search: query.search,
      },
      signal,
    });
  };

  const create = async (body: ArcherCreateDto): Promise<ArcherDto> => {
    const response = await $fetch<{ archer: ArcherDto }>("/api/archers", {
      method: "POST",
      credentials: "include",
      body,
    });

    return response.archer;
  };

  return {
    listPage,
    create,
  };
};
