import { CreateUser } from "~~/application/user/create-user.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toCreateUserInput, toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { UserCreateDto } from "~~/shared/user/user.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const body = await readBody<UserCreateDto>(event);

  const repos = getRepositories();
  const config = useRuntimeConfig(event);

  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;

  const auth = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const createUserHandler = new CreateUser(repos.userRepository, auth.password);
  const user = await createUserHandler.create(toCreateUserInput(body));
  return { user: toUserDto(user) };
});
