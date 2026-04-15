import { ListPublicCompetitions } from "~~/application/competitions/list-public-competitions.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCompetitionDto } from "~~/server/mappers/competition.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["member", "manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = getRepositories();
  const listPublicCompetitionsHandler = new ListPublicCompetitions(
    repos.competitionRepository,
  );
  const rows = await listPublicCompetitionsHandler.findPublic();
  return { competitions: rows.map(toCompetitionDto) };
});
