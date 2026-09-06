import type { MemberRosterItem } from "~~/domain/user/member-roster-item";
import type { MemberRosterItemDto } from "~~/shared/member/member-roster.dto";

export const toMemberRosterItemDto = (
  item: MemberRosterItem,
): MemberRosterItemDto => {
  return {
    status: item.status,
    user_id: item.userId,
    archer_id: item.archerId,
    email: item.email,
    public_name: item.publicName,
    roles: item.roles,
    invited_at: item.invitedAt ? item.invitedAt.toISOString() : null,
    offboarded_at: item.offboardedAt ? item.offboardedAt.toISOString() : null,
  };
};
