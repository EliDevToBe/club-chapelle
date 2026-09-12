import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type ChangeOwnPasswordResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.invalid_credentials
        | typeof API_ERROR_REASON.common.not_found;
    };

export class ChangeOwnPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  public change = async (input: {
    userId: UserId;
    currentPassword: string;
    newPassword: string;
  }): Promise<ChangeOwnPasswordResult> => {
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

    const passwordHash = await this.passwords.hash(input.newPassword);
    const updated = await this.users.update(input.userId, {
      password: passwordHash,
      passwordChangedAt: new Date(),
    });
    if (!updated) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    return { ok: true };
  };
}
