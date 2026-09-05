import { SetUserRole } from "~~/application/user/set-user-role.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { SetUserRoleResponseDto } from "~~/shared/user/set-user-role.dto";
import { setUserRoleBodySchema } from "~~/shared/user/set-user-role.schema";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  const authUser = requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const body = await readBody<Record<string, unknown>>(event);
  const record =
    typeof body === "object" && body !== null
      ? body
      : ({} as Record<string, unknown>);
  const parsed = setUserRoleBodySchema.safeParse(record);

  if (!parsed.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  const { userRepository } = getRepositories();
  const setUserRoleHandler = new SetUserRole(userRepository);
  const result = await setUserRoleHandler.setRole({
    targetUserId: id,
    actorUserId: authUser.id,
    actorRoles: authUser.roles,
    role: parsed.data.role,
  });

  if (!result.ok) {
    if (result.reason === "developer_target") {
      throw ApiError(API_ERROR_REASON.common.forbidden);
    }
    if (result.reason === "invalid_role") {
      throw ApiError(API_ERROR_REASON.common.invalid_request);
    }
    throw ApiError(result.reason);
  }

  const response: SetUserRoleResponseDto = {
    user: toUserDto(result.user),
  };
  return response;
});
