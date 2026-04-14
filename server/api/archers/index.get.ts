import { ListArchers } from "~~/application/archer/list-archers.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toArcherDto } from "~~/server/mappers/archer.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["manager"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = createRepositories();
  const listArchers = new ListArchers(repos.archerRepository);
  const archers = await listArchers.findMany();
  return { archers: archers.map(toArcherDto) };
});
