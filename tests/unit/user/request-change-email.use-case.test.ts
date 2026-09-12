import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { IssueChangeEmailOtp } from "~~/application/user/issue-change-email-otp";
import { RequestChangeEmail } from "~~/application/user/request-change-email.use-case";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("RequestChangeEmail", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let issueOtp: IssueChangeEmailOtp;

  const user: User = {
    id: "u1",
    email: "old@club.test",
    name: "Alex",
    roles: ["member"],
    authenticated: true,
    passwordChangedAt: null,
    createdAt: new Date("2026-01-01"),
  };

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(user),
      findByEmailWithPasswordHash: vi.fn().mockResolvedValue(null),
      findForPasswordResetById: vi.fn().mockResolvedValue({
        id: "u1",
        email: "old@club.test",
        name: "Alex",
        authenticated: true,
        passwordHash: "hash",
      }),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    passwords = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn(),
    };
    issueOtp = {
      issue: vi.fn().mockResolvedValue(undefined),
    } as unknown as IssueChangeEmailOtp;
  });

  it("issues an OTP for a new unused address", async () => {
    const handler = new RequestChangeEmail(users, passwords, issueOtp);
    const result = await handler.request({
      userId: "u1",
      currentPassword: "Secret1!",
      email: "new@club.test",
    });

    expect(result).toEqual({ ok: true });
    expect(issueOtp.issue).toHaveBeenCalledWith({
      user,
      newEmail: "new@club.test",
    });
  });

  it("rejects a wrong password", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    const handler = new RequestChangeEmail(users, passwords, issueOtp);
    const result = await handler.request({
      userId: "u1",
      currentPassword: "nope",
      email: "new@club.test",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_credentials,
    });
    expect(issueOtp.issue).not.toHaveBeenCalled();
  });

  it("rejects the current address", async () => {
    const handler = new RequestChangeEmail(users, passwords, issueOtp);
    const result = await handler.request({
      userId: "u1",
      currentPassword: "Secret1!",
      email: "old@club.test",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.email_unchanged,
    });
  });

  it("rejects an address already linked to another account", async () => {
    users.findByEmailWithPasswordHash = vi.fn().mockResolvedValue({
      id: "other",
      email: "new@club.test",
      name: "Other",
      roles: ["member"],
      authenticated: true,
      passwordHash: "x",
    });
    const handler = new RequestChangeEmail(users, passwords, issueOtp);
    const result = await handler.request({
      userId: "u1",
      currentPassword: "Secret1!",
      email: "new@club.test",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.email_already_linked,
    });
  });
});
