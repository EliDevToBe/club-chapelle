import type { User } from "~~/domain/user/user";

export type CreateInvitedMemberInput = {
  name: string;
  email: string;
};

export type CreateInvitedMemberResult =
  | { ok: true; user: User }
  | { ok: false; reason: "email_taken" | "public_name_taken" };

export type BindInvitedMemberToArcherInput = {
  archerId: string;
  email: string;
  /** Display name stored on the auth_user (typically the archer public_name). */
  name: string;
};

export type BindInvitedMemberToArcherResult =
  | { ok: true; user: User; resent: boolean }
  | {
      ok: false;
      reason:
        | "archer_not_found"
        | "archer_already_linked"
        | "already_authenticated"
        | "email_linked_elsewhere"
        | "email_taken";
    };

export interface InviteMemberPersistence {
  /** Creates `auth_user` (invited) + `member` role + linked archer in one transaction. */
  createInvitedMember: (
    input: CreateInvitedMemberInput,
  ) => Promise<CreateInvitedMemberResult>;

  /**
   * Creates or reuses an invited `auth_user` and links it to an existing
   * unlinked archer shell.
   */
  bindInvitedMemberToArcher: (
    input: BindInvitedMemberToArcherInput,
  ) => Promise<BindInvitedMemberToArcherResult>;
}
