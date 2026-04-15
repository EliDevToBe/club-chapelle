import { createError } from "h3";
import { DeleteParticipation } from "~~/application/participations/delete-participation.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const repos = getRepositories();
  const deleteParticipationHandler = new DeleteParticipation(
    repos.participationRepository,
  );
  const deleted = await deleteParticipationHandler.delete(id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Participation not found",
    });
  }

  return { deleted: true };
});
