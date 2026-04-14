import { createError } from "h3";
import { DeleteCompetition } from "~~/application/competitions/delete-competition.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const repos = createRepositories();
  const deleteCompetitionHandler = new DeleteCompetition(
    repos.competitionRepository,
  );
  const deleted = await deleteCompetitionHandler.delete(id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Competition not found",
    });
  }

  return { deleted: true };
});
