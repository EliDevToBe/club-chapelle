import type { RoleEnum } from "~~/shared/db-enums";

export type MemberRosterStatus = "active" | "invited" | "shell";

/** Archer-centric roster row for admin member management. */
export type MemberRosterItem = {
  status: MemberRosterStatus;
  userId: string | null;
  archerId: string | null;
  email: string | null;
  publicName: string;
  roles: RoleEnum[];
};
