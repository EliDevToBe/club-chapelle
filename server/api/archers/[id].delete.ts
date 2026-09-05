import { DeleteArcher } from "~~/application/archer/delete-archer.use-case";
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

  const { deleteArcherPersistence } = getRepositories();
  const deleteArcherHandler = new DeleteArcher(deleteArcherPersistence);
  const result = await deleteArcherHandler.delete(id);

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  return { deleted: true };
});
