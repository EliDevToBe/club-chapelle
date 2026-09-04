import type { RoleEnum } from "~~/shared/db-enums";

export type MemberRosterStatus = "active" | "invited" | "shell";

/** One row in the admin member roster (archer-centric). */
export type MemberRosterItemDto = {
  status: MemberRosterStatus;
  user_id: string | null;
  archer_id: string | null;
  email: string | null;
  public_name: string;
  roles: RoleEnum[];
};

export type MemberRosterResponseDto = {
  items: MemberRosterItemDto[];
};
