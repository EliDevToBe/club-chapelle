import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import { CancelChangeEmail } from "~~/application/user/cancel-change-email.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("CancelChangeEmail", () => {
  let tokens: TokenRepository;

  beforeEach(() => {
    tokens = {
      issueToken: vi.fn(),
      findUnusedByUserAndType: vi.fn(),
      updateTokenValue: vi.fn(),
      markUsed: vi.fn(),
      revokeUnusedByUserAndType: vi.fn().mockResolvedValue(true),
    };
  });

  it("revokes the unused change-email token", async () => {
    const handler = new CancelChangeEmail(tokens);
    const result = await handler.cancel({ userId: "u1" });

    expect(result).toEqual({ ok: true });
    expect(tokens.revokeUnusedByUserAndType).toHaveBeenCalledWith(
      "u1",
      "change_email",
    );
  });

  it("returns otp_invalid when nothing is pending", async () => {
    tokens.revokeUnusedByUserAndType = vi.fn().mockResolvedValue(false);
    const handler = new CancelChangeEmail(tokens);
    const result = await handler.cancel({ userId: "u1" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.otp_invalid,
    });
  });
});
