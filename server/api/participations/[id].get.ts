import { createError } from "h3";
import { FindParticipationById } from "~~/application/participations/find-participation-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toParticipationDto } from "~~/server/mappers/participation.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const { participationRepository } = getRepositories();
  const findParticipationByIdHandler = new FindParticipationById(
    participationRepository,
  );
  const participation = await findParticipationByIdHandler.findById(id);

  if (!participation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Participation not found",
    });
  }

  return { participation: toParticipationDto(participation) };
});
