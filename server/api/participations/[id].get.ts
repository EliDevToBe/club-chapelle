import { FindParticipationById } from "~~/application/participations/find-participation-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toParticipationDto } from "~~/server/mappers/participation.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const { participationRepository } = getRepositories();
  const findParticipationByIdHandler = new FindParticipationById(
    participationRepository,
  );
  const participation = await findParticipationByIdHandler.findById(id);

  if (!participation) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { participation: toParticipationDto(participation) };
});
