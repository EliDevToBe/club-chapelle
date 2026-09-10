import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { IssueChangeEmailOtp } from "~~/application/user/issue-change-email-otp";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type RequestChangeEmailResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.invalid_credentials
        | typeof API_ERROR_REASON.auth.email_unchanged
        | typeof API_ERROR_REASON.invitation.email_already_linked
        | typeof API_ERROR_REASON.common.not_found;
    };

export class RequestChangeEmail {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly issueOtp: IssueChangeEmailOtp,
  ) {}

  public request = async (input: {
    userId: UserId;
    currentPassword: string;
    email: string;
  }): Promise<RequestChangeEmailResult> => {
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

    if (user.email.trim().toLowerCase() === input.email) {
      return { ok: false, reason: API_ERROR_REASON.auth.email_unchanged };
    }

    const existing = await this.users.findByEmailWithPasswordHash(input.email);
    if (existing && existing.id !== user.id) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.email_already_linked,
      };
    }

    await this.issueOtp.issue({ user, newEmail: input.email });
    return { ok: true };
  };
}
