import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { IssueChangeEmailOtp } from "~~/application/user/issue-change-email-otp";
import { ResendChangeEmail } from "~~/application/user/resend-change-email.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("ResendChangeEmail", () => {
  let users: UserRepository;
  let tokens: TokenRepository;
  let issueOtp: IssueChangeEmailOtp;

  const user = {
    id: "u1",
    email: "old@club.test",
    name: "Alex",
    roles: ["member"] as const,
    authenticated: true,
    createdAt: new Date("2026-01-01"),
  };

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(user),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    tokens = {
      issueToken: vi.fn(),
      findUnusedByUserAndType: vi.fn().mockResolvedValue({
        id: "tok-1",
        authUserId: "u1",
        tokenValue: JSON.stringify({
          new_email: "new@club.test",
          otp_hash: "otp-hash",
          failed_attempts: 0,
        }),
        type: "change_email",
        createdAt: new Date(Date.now() - 31_000),
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      }),
      updateTokenValue: vi.fn(),
      markUsed: vi.fn(),
      revokeUnusedByUserAndType: vi.fn(),
    };
    issueOtp = {
      issue: vi.fn().mockResolvedValue(undefined),
    } as unknown as IssueChangeEmailOtp;
  });

  it("issues a new OTP after the cooldown", async () => {
    const handler = new ResendChangeEmail(users, tokens, issueOtp);
    const result = await handler.resend({ userId: "u1" });

    expect(result).toEqual({ ok: true });
    expect(issueOtp.issue).toHaveBeenCalledWith({
      user,
      newEmail: "new@club.test",
    });
  });

  it("rejects when the cooldown has not elapsed", async () => {
    tokens.findUnusedByUserAndType = vi.fn().mockResolvedValue({
      id: "tok-1",
      authUserId: "u1",
      tokenValue: JSON.stringify({
        new_email: "new@club.test",
        otp_hash: "otp-hash",
        failed_attempts: 0,
      }),
      type: "change_email",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    const handler = new ResendChangeEmail(users, tokens, issueOtp);
    const result = await handler.resend({ userId: "u1" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.otp_cooldown,
    });
  });
});
