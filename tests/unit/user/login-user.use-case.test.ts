import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { LoginUser } from "~~/application/user/login-user.use-case";

let users: UserRepository;
let passwords: PasswordHasher;
let jwt: JwtAuthService;

beforeEach(() => {
  users = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmailForPasswordReset: vi.fn(),
    findForPasswordResetById: vi.fn(),
    findByEmailWithPasswordHash: vi.fn().mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      name: null,
      roles: ["member"],
      authenticated: true,
      passwordHash: "argon-hash",
    }),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  passwords = {
    hash: vi.fn(),
    verify: vi.fn().mockResolvedValue(true),
  };
  jwt = {
    signAccess: vi.fn().mockReturnValue("access-jwt"),
    signRefresh: vi.fn().mockReturnValue("refresh-jwt"),
    signForgotPasswordToken: vi.fn(),
    verifyForgotPasswordToken: vi.fn(),
    verifyAccess: vi.fn(),
    verifyRefresh: vi.fn(),
  };
});

describe("LoginUser", () => {
  it("returns tokens when credentials match and user is authenticated", async () => {
    const login = new LoginUser(users, passwords, jwt);
    const result = await login.login({
      email: "a@b.c",
      password: "secret",
    });

    expect(result).toEqual({
      ok: true,
      accessToken: "access-jwt",
      refreshToken: "refresh-jwt",
      session: {
        id: "u1",
        name: null,
        roles: ["member"],
      },
    });
    expect(passwords.verify).toHaveBeenCalledWith("secret", "argon-hash");
    expect(jwt.signAccess).toHaveBeenCalledWith("u1");
    expect(jwt.signRefresh).toHaveBeenCalledWith("u1");
  });

  it("fails when user is not authenticated", async () => {
    users.findByEmailWithPasswordHash = vi.fn().mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      name: null,
      roles: ["member"],
      authenticated: false,
      passwordHash: "argon-hash",
    });

    const login = new LoginUser(users, passwords, jwt);
    const result = await login.login({ email: "a@b.c", password: "secret" });
    expect(result).toEqual({ ok: false, reason: "User is not authenticated" });
  });

  it("fails when password is wrong", async () => {
    users.findByEmailWithPasswordHash = vi.fn().mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      name: null,
      roles: ["member"],
      authenticated: true,
      passwordHash: "argon-hash",
    });
    passwords.verify = vi.fn().mockResolvedValue(false);

    const login = new LoginUser(users, passwords, jwt);
    const result = await login.login({ email: "a@b.c", password: "bad" });
    expect(result).toEqual({ ok: false, reason: "Invalid email or password" });
  });
});
