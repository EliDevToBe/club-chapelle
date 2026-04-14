import { CreateCompetition } from "~~/application/competitions/create-competition.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
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

  const repos = createRepositories();
  const createCompetition = new CreateCompetition(repos.competitionRepository);
  const competition = await createCompetition.create(
    toCreateCompetitionInput(body),
  );
  return { competition: toCompetitionDto(competition) };
});
