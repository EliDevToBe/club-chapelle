import type { UserId } from "~~/domain/user/user";
import type { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type RevokeMemberAccessResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.user.self_revoke;
    };

export interface RevokeMemberAccessPersistence {
  /**
   * Unlinks all archers from the user, clears password, sets authenticated
   * false, and revokes unused tokens. Keeps the auth_user row.
   */
  revokeAccess: (userId: UserId) => Promise<boolean>;
}
