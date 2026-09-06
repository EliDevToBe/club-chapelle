import { DeleteCompetition } from "~~/application/competitions/delete-competition.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
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

  const { competitionRepository } = getRepositories();
  const deleteCompetitionHandler = new DeleteCompetition(competitionRepository);
  const deleted = await deleteCompetitionHandler.delete(id);

  if (!deleted) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { deleted: true };
});
