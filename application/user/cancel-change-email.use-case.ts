import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export type CancelChangeEmailResult =
  | { ok: true }
  | { ok: false; reason: typeof API_ERROR_REASON.auth.otp_invalid };

export class CancelChangeEmail {
  constructor(private readonly tokens: TokenRepository) {}

  public cancel = async (input: {
    userId: UserId;
  }): Promise<CancelChangeEmailResult> => {
    const revoked = await this.tokens.revokeUnusedByUserAndType(
      input.userId,
      "change_email",
    );
    if (!revoked) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    return { ok: true };
  };
}
