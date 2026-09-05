import { DeleteUser } from "~~/application/user/delete-user.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const { userRepository } = getRepositories();
  const deleteUserHandler = new DeleteUser(userRepository);
  const deleted = await deleteUserHandler.delete(id);

  if (!deleted) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { deleted: true };
});
