import { ListParticipations } from "~~/application/participations/list-participations.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toParticipationDto } from "~~/server/mappers/participation.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = getRepositories();
  const listParticipationsHandler = new ListParticipations(
    repos.participationRepository,
  );
  const participations = await listParticipationsHandler.findMany();
  return { participations: participations.map(toParticipationDto) };
});
