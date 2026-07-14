import { ListUsers } from "~~/application/user/list-users.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const { userRepository } = getRepositories();
  const listUsersHandler = new ListUsers(userRepository);
  const users = await listUsersHandler.findMany();
  return { users: users.map(toUserDto) };
});
