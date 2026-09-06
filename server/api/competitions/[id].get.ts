import { FindCompetitionById } from "~~/application/competitions/find-competition-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCompetitionDto } from "~~/server/mappers/competition.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["member", "manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const { competitionRepository } = getRepositories();
  const findCompetitionByIdHandler = new FindCompetitionById(
    competitionRepository,
  );
  const competition = await findCompetitionByIdHandler.findById(id);

  if (!competition) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { competition: toCompetitionDto(competition) };
});
