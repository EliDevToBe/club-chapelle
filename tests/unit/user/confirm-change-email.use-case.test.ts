import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { ConfirmChangeEmail } from "~~/application/user/confirm-change-email.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("ConfirmChangeEmail", () => {
  let users: UserRepository;
  let tokens: TokenRepository;
  let passwords: PasswordHasher;

  const payload = JSON.stringify({
    new_email: "new@club.test",
    otp_hash: "otp-hash",
    failed_attempts: 0,
  });

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn().mockResolvedValue(null),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn().mockResolvedValue({
        id: "u1",
        email: "new@club.test",
        name: "Alex",
        roles: ["member"],
        authenticated: true,
        createdAt: new Date("2026-01-01"),
      }),
      delete: vi.fn(),
    };
    tokens = {
      issueToken: vi.fn(),
      findUnusedByUserAndType: vi.fn().mockResolvedValue({
        id: "tok-1",
        authUserId: "u1",
        tokenValue: payload,
        type: "change_email",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      }),
      updateTokenValue: vi.fn().mockResolvedValue(true),
      markUsed: vi.fn().mockResolvedValue(true),
      revokeUnusedByUserAndType: vi.fn().mockResolvedValue(true),
    };
    passwords = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn(),
    };
  });

  it("applies the new email and marks the token used", async () => {
    const handler = new ConfirmChangeEmail(users, tokens, passwords);
    const result = await handler.confirm({ userId: "u1", otp: "123456" });

    expect(result).toEqual({ ok: true, email: "new@club.test" });
    expect(users.update).toHaveBeenCalledWith("u1", {
      email: "new@club.test",
    });
    expect(tokens.markUsed).toHaveBeenCalledWith("tok-1");
  });

  it("increments failed attempts on a bad OTP", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    const handler = new ConfirmChangeEmail(users, tokens, passwords);
    const result = await handler.confirm({ userId: "u1", otp: "000000" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.otp_invalid,
    });
    expect(tokens.updateTokenValue).toHaveBeenCalled();
    expect(users.update).not.toHaveBeenCalled();
  });

  it("revokes the token after five failed attempts", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    tokens.findUnusedByUserAndType = vi.fn().mockResolvedValue({
      id: "tok-1",
      authUserId: "u1",
      tokenValue: JSON.stringify({
        new_email: "new@club.test",
        otp_hash: "otp-hash",
        failed_attempts: 4,
      }),
      type: "change_email",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    const handler = new ConfirmChangeEmail(users, tokens, passwords);
    const result = await handler.confirm({ userId: "u1", otp: "000000" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.otp_invalid,
    });
    expect(tokens.revokeUnusedByUserAndType).toHaveBeenCalledWith(
      "u1",
      "change_email",
    );
  });

  it("rejects when the new address is taken", async () => {
    users.findByEmailWithPasswordHash = vi.fn().mockResolvedValue({
      id: "other",
      email: "new@club.test",
      name: "Other",
      roles: ["member"],
      authenticated: true,
      passwordHash: "x",
    });
    const handler = new ConfirmChangeEmail(users, tokens, passwords);
    const result = await handler.confirm({ userId: "u1", otp: "123456" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.email_already_linked,
    });
  });
});
