import { UpdateParticipation } from "~~/application/participations/update-participation.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toParticipationDto,
  toUpdateParticipationInput,
} from "~~/server/mappers/participation.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { ParticipationUpdateDto } from "~~/shared/participation/participation.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const body = await readBody<ParticipationUpdateDto>(event);
  const { participationRepository } = getRepositories();
  const updateParticipationHandler = new UpdateParticipation(
    participationRepository,
  );
  const participation = await updateParticipationHandler.update(
    id,
    toUpdateParticipationInput(body),
  );

  if (!participation) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { participation: toParticipationDto(participation) };
});
