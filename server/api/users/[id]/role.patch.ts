import { createError } from "h3";
import { SetUserRole } from "~~/application/user/set-user-role.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { SetUserRoleResponseDto } from "~~/shared/user/set-user-role.dto";
import { setUserRoleBodySchema } from "~~/shared/user/set-user-role.schema";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  const authUser = requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const record =
    typeof body === "object" && body !== null
      ? body
      : ({} as Record<string, unknown>);
  const parsed = setUserRoleBodySchema.safeParse(record);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
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
    if (result.reason === "self_change") {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot change your own role",
      });
    }
    if (result.reason === "not_found") {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }
    if (result.reason === "developer_target") {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot change a developer account",
      });
    }
    if (result.reason === "admin_target") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only a developer can demote an admin",
      });
    }
    if (result.reason === "last_admin") {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot demote the last admin",
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const response: SetUserRoleResponseDto = {
    user: toUserDto(result.user),
  };
  return response;
});
