import { describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { User } from "~~/domain/user/user";
import { resolveAuthContextFromCookies } from "~~/server/utils/resolve-auth-context";

const sampleUser: User = {
  id: "u1",
  email: "x@y.z",
  role: "member",
  authenticated: true,
  createdAt: new Date("2026-01-01"),
};

describe("resolveAuthContextFromCookies", () => {
  it("returns auth from a valid access token", async () => {
    const jwt: JwtAuthService = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      verifyAccess: vi.fn().mockReturnValue("u1"),
      verifyRefresh: vi.fn(),
    };
    const result = await resolveAuthContextFromCookies({
      accessToken: "access",
      refreshToken: "refresh",
      jwt,
      findUserById: vi.fn().mockResolvedValue(sampleUser),
    });
    expect(result.authUser).toEqual({
      id: "u1",
      role: "member",
      authenticated: true,
    });
    expect(result.newAccessToken).toBeNull();
    expect(jwt.verifyRefresh).not.toHaveBeenCalled();
  });

  it("issues new access when access fails but refresh is valid", async () => {
    const jwt: JwtAuthService = {
      signAccess: vi.fn().mockReturnValue("new-access"),
      signRefresh: vi.fn(),
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
      role: "member",
      authenticated: true,
    });
    expect(result.newAccessToken).toBe("new-access");
    expect(jwt.signAccess).toHaveBeenCalledWith("u1");
  });
});
