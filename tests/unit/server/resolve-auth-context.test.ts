import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { User } from "~~/domain/user/user";
import { resolveAuthContextFromCookies } from "~~/server/utils/resolve-auth-context";

const sampleUser: User = {
  id: "u1",
  email: "x@y.z",
  name: "Sam",
  roles: ["member"],
  authenticated: true,
  createdAt: new Date("2026-01-01"),
};

describe("resolveAuthContextFromCookies", () => {
  let jwt: JwtAuthService;
  let findUserById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jwt = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signForgotPasswordToken: vi.fn(),
      verifyForgotPasswordToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    findUserById = vi.fn();
  });

  it("returns auth from a valid access token", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue("u1");
    findUserById = vi.fn().mockResolvedValue(sampleUser);
    const result = await resolveAuthContextFromCookies({
      accessToken: "access",
      refreshToken: "refresh",
      jwt,
      findUserById,
    });
    expect(result.authUser).toEqual({
      id: "u1",
      name: "Sam",
      roles: ["member"],
      authenticated: true,
    });
    expect(result.newAccessToken).toBeNull();
    expect(jwt.verifyRefresh).not.toHaveBeenCalled();
  });

  it("issues new access when access fails but refresh is valid", async () => {
    jwt.signAccess = vi.fn().mockReturnValue("new-access");
    jwt.verifyAccess = vi.fn().mockReturnValue(null);
    jwt.verifyRefresh = vi.fn().mockReturnValue("u1");
    findUserById = vi.fn().mockResolvedValue(sampleUser);
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad",
      refreshToken: "good-refresh",
      jwt,
      findUserById,
    });
    expect(result.authUser).toEqual({
      id: "u1",
      name: "Sam",
      roles: ["member"],
      authenticated: true,
    });
    expect(result.newAccessToken).toBe("new-access");
    expect(jwt.signAccess).toHaveBeenCalledWith("u1");
  });

  it("returns null when both cookies are absent", async () => {
    const result = await resolveAuthContextFromCookies({
      accessToken: undefined,
      refreshToken: undefined,
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
    expect(jwt.verifyAccess).not.toHaveBeenCalled();
    expect(jwt.verifyRefresh).not.toHaveBeenCalled();
  });

  it("returns null when access token is invalid and there is no refresh cookie", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue(null);
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad",
      refreshToken: undefined,
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });

  it("returns null when access verifies but user no longer exists", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue("u1");
    findUserById = vi.fn().mockResolvedValue(null);
    const result = await resolveAuthContextFromCookies({
      accessToken: "access",
      refreshToken: undefined,
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
    expect(findUserById).toHaveBeenCalledWith("u1");
  });

  it("returns null when refresh verifies but user no longer exists", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue(null);
    jwt.verifyRefresh = vi.fn().mockReturnValue("u1");
    findUserById = vi.fn().mockResolvedValue(null);
    const result = await resolveAuthContextFromCookies({
      accessToken: undefined,
      refreshToken: "refresh",
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
    expect(jwt.signAccess).not.toHaveBeenCalled();
  });

  it("returns null when refresh token is present but invalid", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue(null);
    jwt.verifyRefresh = vi.fn().mockReturnValue(null);
    const result = await resolveAuthContextFromCookies({
      accessToken: undefined,
      refreshToken: "bad-refresh",
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });

  it("returns null when both tokens are present but both invalid", async () => {
    jwt.verifyAccess = vi.fn().mockReturnValue(null);
    jwt.verifyRefresh = vi.fn().mockReturnValue(null);
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad-access",
      refreshToken: "bad-refresh",
      jwt,
      findUserById,
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });
});
