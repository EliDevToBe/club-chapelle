import { createError } from "h3";
import { DeleteArcher } from "~~/application/archer/delete-archer.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const repos = createRepositories();
  const deleteArcherHandler = new DeleteArcher(repos.archerRepository);
  const deleted = await deleteArcherHandler.delete(id);

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Archer not found" });
  }

  return { deleted: true };
});
