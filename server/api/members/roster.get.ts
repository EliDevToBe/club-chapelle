import { ListMemberRoster } from "~~/application/user/list-member-roster.use-case";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { toMemberRosterItemDto } from "~~/server/mappers/member-roster.mapper";
import { parseMembersRosterListQuery } from "~~/server/utils/members-roster-query";
import { requireRoles } from "~~/server/utils/rbac";
import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterResponseDto } from "~~/shared/member/member-roster.dto";

const allowedRoles: RoleEnum[] = ["admin"];

export default defineEventHandler(async (event) => {
  requireRoles(event, allowedRoles);

  const query = parseMembersRosterListQuery(event);
  const { memberRosterQuery } = getRepositories();
  const listMemberRosterHandler = new ListMemberRoster(memberRosterQuery);
  const page = await listMemberRosterHandler.findPage(query);

  const response: MemberRosterResponseDto = {
    items: page.items.map(toMemberRosterItemDto),
    total: page.total,
  };
  return response;
});
