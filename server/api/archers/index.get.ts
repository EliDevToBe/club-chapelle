import { ListArchers } from "~~/application/archer/list-archers.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toArcherDto } from "~~/server/mappers/archer.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = getRepositories();
  const listArchersHandler = new ListArchers(repos.archerRepository);
  const archers = await listArchersHandler.findMany();
  return { archers: archers.map(toArcherDto) };
});
