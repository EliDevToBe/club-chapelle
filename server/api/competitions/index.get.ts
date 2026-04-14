import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCompetitionDto } from "~~/server/mappers/competition.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["member", "manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = createRepositories();
  const listPublicCompetitions = new ListPublicCompetitions(
    repos.competitionRepository,
  );
  const rows = await listPublicCompetitions.findPublic();
  return { competitions: rows.map(toCompetitionDto) };
});
