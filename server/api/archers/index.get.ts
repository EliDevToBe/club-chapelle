import { ListArchers } from "~~/application/archer/list-archers.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toArcherDto } from "~~/server/mappers/archer.mapper";
import { parseArchersListQuery } from "~~/server/utils/archers-list-query";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["manager", "admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const query = parseArchersListQuery(event);
  const { archerRepository } = getRepositories();
  const listArchersHandler = new ListArchers(archerRepository);

  if (query.limit === undefined) {
    const archers = await listArchersHandler.findMany();
    return {
      archers: archers.map(toArcherDto),
      total: archers.length,
    };
  }

  const page = await listArchersHandler.findPage({
    limit: query.limit,
    offset: query.offset,
    search: query.search,
  });

  return {
    archers: page.items.map(toArcherDto),
    total: page.total,
  };
});
