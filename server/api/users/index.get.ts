import { ListUsers } from "~~/application/user/list-users.use-case";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toUserDto } from "~~/server/mappers/user.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);
  const repos = createRepositories();
  const listUsers = new ListUsers(repos.userRepository);
  const users = await listUsers.findMany();
  return { users: users.map(toUserDto) };
});
