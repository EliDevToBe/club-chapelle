import { createError } from "h3";
import { UpdateParticipation } from "~~/application/participations/update-participation.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toParticipationDto,
  toUpdateParticipationInput,
} from "~~/server/mappers/participation.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { ParticipationUpdateDto } from "~~/shared/participation/participation.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
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
    throw createError({
      statusCode: 404,
      statusMessage: "Participation not found",
    });
  }

  return { participation: toParticipationDto(participation) };
});
