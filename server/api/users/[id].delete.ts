import { createError } from "h3";
import { DeleteUser } from "~~/application/user/delete-user.use-case";
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
  const deleteUser = new DeleteUser(repos.userRepository);
  const deleted = await deleteUser.delete(id);

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return { deleted: true };
});
