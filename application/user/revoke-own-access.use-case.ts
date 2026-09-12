import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { RevokeMemberAccessPersistence } from "~~/application/ports/revoke-member-access-persistence.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type RevokeOwnAccessResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.invalid_credentials
        | typeof API_ERROR_REASON.user_role.last_admin
        | typeof API_ERROR_REASON.common.not_found;
    };

export class RevokeOwnAccess {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly persistence: RevokeMemberAccessPersistence,
  ) {}

  public revoke = async (input: {
    userId: UserId;
    currentPassword: string;
  }): Promise<RevokeOwnAccessResult> => {
    const row = await this.users.findForPasswordResetById(input.userId);
    if (!row?.passwordHash || !row.authenticated) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    const passwordOk = await this.passwords.verify(
      input.currentPassword,
      row.passwordHash,
    );
    if (!passwordOk) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_credentials };
    }

    const user = await this.users.findById(input.userId);
    if (!user) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    if (user.roles.includes("admin")) {
      const admins = await this.users.findManyForListing({ roles: ["admin"] });
      if (admins.length <= 1) {
        return { ok: false, reason: API_ERROR_REASON.user_role.last_admin };
      }
    }

    const revoked = await this.persistence.revokeAccess(input.userId);
    if (!revoked) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    return { ok: true };
  };
}
