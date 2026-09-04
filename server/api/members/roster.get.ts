import { ListMemberRoster } from "~~/application/user/list-member-roster.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toMemberRosterItemDto } from "~~/server/mappers/member-roster.mapper";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterResponseDto } from "~~/shared/member/member-roster.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);

  const { userRepository, archerRepository } = getRepositories();
  const listMemberRosterHandler = new ListMemberRoster(
    userRepository,
    archerRepository,
  );
  const items = await listMemberRosterHandler.findMany();

  const response: MemberRosterResponseDto = {
    items: items.map(toMemberRosterItemDto),
  };
  return response;
});
