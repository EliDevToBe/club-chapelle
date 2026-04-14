import { createError } from "h3";
import { UpdateCompetition } from "~~/application/competitions/update-competition.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toCompetitionDto,
  toUpdateCompetitionInput,
} from "~~/server/mappers/competition.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { CompetitionUpdateDto } from "~~/shared/competitions/competition.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const body = await readBody<CompetitionUpdateDto>(event);
  const repos = createRepositories();
  const updateCompetition = new UpdateCompetition(repos.competitionRepository);
  const competition = await updateCompetition.update(
    id,
    toUpdateCompetitionInput(body),
  );

  if (!competition) {
    throw createError({
      statusCode: 404,
      statusMessage: "Competition not found",
    });
  }

  return { competition: toCompetitionDto(competition) };
});
