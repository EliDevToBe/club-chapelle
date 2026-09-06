import { UpdateUser } from "~~/application/user/update-user.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUpdateUserInput, toUserDto } from "~~/server/mappers/user.mapper";
import { ApiError } from "~~/server/utils/api-error";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { RoleEnum } from "~~/shared/db-enums";
import type { UserUpdateDto } from "~~/shared/user/user.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw ApiError(API_ERROR_REASON.common.missing_id);
  }

  const body = await readBody<UserUpdateDto>(event);
  const { userRepository } = getRepositories();
  const config = useRuntimeConfig(event);

  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;

  const auth = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const updateUserHandler = new UpdateUser(userRepository, auth.password);
  const user = await updateUserHandler.update(id, toUpdateUserInput(body));

  if (!user) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { user: toUserDto(user) };
});
