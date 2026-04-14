import { createError } from "h3";
import { FindArcherById } from "~~/application/archer/find-archer-by-id.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toArcherDto } from "~~/server/mappers/archer.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["manager"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const repos = createRepositories();
  const findArcherById = new FindArcherById(repos.archerRepository);
  const archer = await findArcherById.findById(id);

  if (!archer) {
    throw createError({ statusCode: 404, statusMessage: "Archer not found" });
  }

  return { archer: toArcherDto(archer) };
});
