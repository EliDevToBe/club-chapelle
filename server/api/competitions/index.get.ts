import { ListCompetitionsWithParticipations } from "~~/application/competitions/list-competitions-with-participations-for-browse.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCompetitionListingDto } from "~~/server/mappers/competition-listing.mapper";
import { parseCompetitionsListingQuery } from "~~/server/utils/competitions-listing-query";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["member", "manager", "admin"];

export default defineEventHandler(async (event) => {
  const authUser = requireRoles(event, allowedRoles);
  const parsed = parseCompetitionsListingQuery(event);
  const repos = getRepositories();

  const listHandler = new ListCompetitionsWithParticipations(
    repos.competitionRepository,
    repos.participationRepository,
  );

  const inputFilters = {
    dateFilter: {
      startDateYmd: parsed.dateStartYmd,
      endDateYmd: parsed.dateEndYmd,
    },
    q: parsed.q,
    onlyMine: parsed.onlyMine,
    viewerUserId: authUser.id,
    viewerName: authUser.name,
  };

  const rows = await listHandler.list(inputFilters);

  const viewer = { userId: authUser.id, roles: authUser.roles };

  const competitions = rows.map((row) => {
    return toCompetitionListingDto(row.competition, row.participations, viewer);
  });

  return { competitions };
});
