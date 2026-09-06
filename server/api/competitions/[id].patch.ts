import { UpdateCompetition } from "~~/application/competitions/update-competition.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toCompetitionDto,
  toUpdateCompetitionInput,
} from "~~/server/mappers/competition.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { CompetitionUpdateDto } from "~~/shared/competitions/competition.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const body = await readBody<CompetitionUpdateDto>(event);
  const { competitionRepository } = getRepositories();
  const updateCompetitionHandler = new UpdateCompetition(competitionRepository);
  const competition = await updateCompetitionHandler.update(
    id,
    toUpdateCompetitionInput(body),
  );

  if (!competition) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { competition: toCompetitionDto(competition) };
});
