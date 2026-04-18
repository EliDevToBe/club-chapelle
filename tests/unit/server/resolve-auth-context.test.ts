import { describe, expect, it, vi } from "vitest";
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

const jwtNoop: JwtAuthService = {
  signAccess: vi.fn(),
  signRefresh: vi.fn(),
  verifyAccess: vi.fn(),
  verifyRefresh: vi.fn(),
};

describe("resolveAuthContextFromCookies", () => {
  it("returns auth from a valid access token", async () => {
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue("u1"),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: "access",
      refreshToken: "refresh",
      jwt,
      findUserById: vi.fn().mockResolvedValue(sampleUser),
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
    const jwt: JwtAuthService = {
      ...jwtNoop,
      signAccess: vi.fn().mockReturnValue("new-access"),
      verifyAccess: vi.fn().mockReturnValue(null),
      verifyRefresh: vi.fn().mockReturnValue("u1"),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad",
      refreshToken: "good-refresh",
      jwt,
      findUserById: vi.fn().mockResolvedValue(sampleUser),
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
      jwt: jwtNoop,
      findUserById: vi.fn(),
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
    expect(jwtNoop.verifyAccess).not.toHaveBeenCalled();
    expect(jwtNoop.verifyRefresh).not.toHaveBeenCalled();
  });

  it("returns null when access token is invalid and there is no refresh cookie", async () => {
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue(null),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad",
      refreshToken: undefined,
      jwt,
      findUserById: vi.fn(),
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });

  it("returns null when access verifies but user no longer exists", async () => {
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue("u1"),
    };
    const findUserById = vi.fn().mockResolvedValue(null);
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
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue(null),
      verifyRefresh: vi.fn().mockReturnValue("u1"),
    };
    const findUserById = vi.fn().mockResolvedValue(null);
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
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue(null),
      verifyRefresh: vi.fn().mockReturnValue(null),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: undefined,
      refreshToken: "bad-refresh",
      jwt,
      findUserById: vi.fn(),
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });

  it("returns null when both tokens are present but both invalid", async () => {
    const jwt: JwtAuthService = {
      ...jwtNoop,
      verifyAccess: vi.fn().mockReturnValue(null),
      verifyRefresh: vi.fn().mockReturnValue(null),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: "bad-access",
      refreshToken: "bad-refresh",
      jwt,
      findUserById: vi.fn(),
    });
    expect(result).toEqual({ authUser: null, newAccessToken: null });
  });
});
