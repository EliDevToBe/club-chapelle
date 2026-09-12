import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { ChangeOwnPassword } from "~~/application/user/change-own-password.use-case";
import type { SendPasswordChangedNotice } from "~~/application/user/send-password-changed-notice";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("ChangeOwnPassword", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let notice: SendPasswordChangedNotice;

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        authenticated: true,
        passwordHash: "old-hash",
      }),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        roles: ["member"],
        authenticated: true,
        createdAt: new Date("2026-01-01"),
      }),
      delete: vi.fn(),
    };
    passwords = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn().mockResolvedValue("new-hash"),
    };
    notice = {
      send: vi.fn().mockResolvedValue(undefined),
    } as unknown as SendPasswordChangedNotice;
  });

  it("hashes the new password after verifying the current one", async () => {
    const handler = new ChangeOwnPassword(users, passwords, notice);
    const result = await handler.change({
      userId: "u1",
      currentPassword: "Oldpass1!",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({ ok: true });
    expect(passwords.verify).toHaveBeenCalledWith("Oldpass1!", "old-hash");
    expect(users.update).toHaveBeenCalledWith("u1", {
      password: "new-hash",
      passwordChangedAt: expect.any(Date),
    });
  });

  it("sends the password-changed notice after a successful change", async () => {
    const handler = new ChangeOwnPassword(users, passwords, notice);
    const result = await handler.change({
      userId: "u1",
      currentPassword: "Oldpass1!",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({ ok: true });
    expect(notice.send).toHaveBeenCalledWith({
      userId: "u1",
      email: "a@b.c",
      name: "Alex",
    });
  });

  it("rejects a wrong current password", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    const handler = new ChangeOwnPassword(users, passwords, notice);
    const result = await handler.change({
      userId: "u1",
      currentPassword: "nope",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_credentials,
    });
    expect(users.update).not.toHaveBeenCalled();
    expect(notice.send).not.toHaveBeenCalled();
  });
});
