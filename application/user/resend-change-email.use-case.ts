import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { IssueChangeEmailOtp } from "~~/application/user/issue-change-email-otp";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import {
  CHANGE_EMAIL_RESEND_COOLDOWN_SECONDS,
  parseChangeEmailTokenValue,
} from "~~/shared/auth/email-change";

export type ResendChangeEmailResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.otp_invalid
        | typeof API_ERROR_REASON.auth.otp_cooldown
        | typeof API_ERROR_REASON.common.not_found;
    };

export class ResendChangeEmail {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
    private readonly issueOtp: IssueChangeEmailOtp,
  ) {}

  public resend = async (input: {
    userId: UserId;
  }): Promise<ResendChangeEmailResult> => {
    const user = await this.users.findById(input.userId);
    if (!user) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    const token = await this.tokens.findUnusedByUserAndType(
      input.userId,
      "change_email",
    );
    if (!token || token.expiresAt <= new Date()) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    const payload = parseChangeEmailTokenValue(token.tokenValue);
    if (!payload) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    const elapsedMs = Date.now() - token.createdAt.getTime();
    if (elapsedMs < CHANGE_EMAIL_RESEND_COOLDOWN_SECONDS * 1000) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_cooldown };
    }

    await this.issueOtp.issue({ user, newEmail: payload.new_email });
    return { ok: true };
  };
}
