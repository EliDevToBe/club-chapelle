import { createError } from "h3";
import { UpdateUser } from "~~/application/user/update-user.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUpdateUserInput, toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { UserUpdateDto } from "~~/shared/user/user.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const body = await readBody<UserUpdateDto>(event);
  const repos = getRepositories();
  const config = useRuntimeConfig(event);

  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;

  const auth = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const updateUserHandler = new UpdateUser(repos.userRepository, auth.password);
  const user = await updateUserHandler.update(id, toUpdateUserInput(body));

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return { user: toUserDto(user) };
});
