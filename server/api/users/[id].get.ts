import { FindUserById } from "~~/application/user/find-user-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
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
  const findUserByIdHandler = new FindUserById(userRepository);
  const user = await findUserByIdHandler.findById(id);

  if (!user) {
    throw ApiError(API_ERROR_REASON.common.not_found);
  }

  return { user: toUserDto(user) };
});
