import { CreateCompetition } from "~~/application/competitions/create-competition.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import {
  toCompetitionDto,
  toCreateCompetitionInput,
} from "~~/server/mappers/competition.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { CompetitionCreateDto } from "~~/shared/competitions/competition.dto";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const body = await readBody<CompetitionCreateDto>(event);

  const { competitionRepository } = getRepositories();
  const createCompetitionHandler = new CreateCompetition(competitionRepository);
  const competition = await createCompetitionHandler.create(
    toCreateCompetitionInput(body),
  );
  return { competition: toCompetitionDto(competition) };
});
