import type { User } from "~~/domain/user/user";

export type CreateInvitedMemberInput = {
  name: string;
  email: string;
};

export type CreateInvitedMemberResult =
  | { ok: true; user: User }
  | { ok: false; reason: "email_taken" | "public_name_taken" };

export interface InviteMemberPersistence {
  /** Creates `auth_user` (invited) + `member` role + linked archer in one transaction. */
  createInvitedMember: (
    input: CreateInvitedMemberInput,
  ) => Promise<CreateInvitedMemberResult>;
}
