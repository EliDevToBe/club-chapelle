import { describe, expect, it } from "vitest";
import { JsonWebTokenAuthService } from "~~/infrastructure/auth/jsonwebtoken-auth.service";

describe("JsonWebTokenAuthService", () => {
  it("does not verify a refresh JWT with the access secret", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const refresh = svc.signRefresh("user-1");
    expect(svc.verifyAccess(refresh)).toBeNull();
  });

  it("does not verify an access JWT with the refresh secret", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const access = svc.signAccess("user-2");
    expect(svc.verifyRefresh(access)).toBeNull();
  });

  it("round-trips access and refresh independently", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const access = svc.signAccess("user-3");
    const refresh = svc.signRefresh("user-3");
    expect(svc.verifyAccess(access)).toBe("user-3");
    expect(svc.verifyRefresh(refresh)).toBe("user-3");
  });
});
