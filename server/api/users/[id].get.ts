import { createError } from "h3";
import { FindUserById } from "~~/application/user/find-user-by-id.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const { userRepository } = getRepositories();
  const findUserByIdHandler = new FindUserById(userRepository);
  const user = await findUserByIdHandler.findById(id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return { user: toUserDto(user) };
});
