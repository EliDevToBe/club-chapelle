import type { UserId } from "~~/domain/user/user";

export type RevokeMemberAccessResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "self_revoke";
    };

export interface RevokeMemberAccessPersistence {
  /**
   * Unlinks all archers from the user, clears password, sets authenticated
   * false, and revokes unused tokens. Keeps the auth_user row.
   */
  revokeAccess: (userId: UserId) => Promise<boolean>;
}
