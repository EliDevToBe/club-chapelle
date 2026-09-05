import { RevokeMemberAccess } from "~~/application/user/revoke-member-access.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  const authUser = requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const { revokeMemberAccessPersistence } = getRepositories();
  const revokeMemberAccessHandler = new RevokeMemberAccess(
    revokeMemberAccessPersistence,
  );
  const result = await revokeMemberAccessHandler.revoke({
    targetUserId: id,
    actorUserId: authUser.id,
  });

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  return { ok: true };
});
