import type { User } from "~~/domain/user/user";
import type { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type CreateInvitedMemberInput = {
  name: string;
  email: string;
};

export type CreateInvitedMemberResult =
  | { ok: true; user: User }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.invitation.email_already_linked
        | typeof API_ERROR_REASON.invitation.public_name_taken;
    };

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
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.invitation.archer_already_linked
        | typeof API_ERROR_REASON.invitation.account_already_active
        | typeof API_ERROR_REASON.invitation.email_already_linked;
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
