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

  it("does not verify a forgot-password JWT as an access session", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const forgot = svc.signForgotPasswordToken("user-4");
    expect(svc.verifyAccess(forgot)).toBeNull();
  });

  it("round-trips a forgot-password JWT via verifyForgotPasswordToken", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const forgot = svc.signForgotPasswordToken("user-5");
    expect(svc.verifyForgotPasswordToken(forgot)).toBe("user-5");
  });

  it("does not verify an access JWT as a forgot-password recovery token", () => {
    const svc = new JsonWebTokenAuthService(
      "access-secret-a",
      "refresh-secret-b",
    );
    const access = svc.signAccess("user-6");
    expect(svc.verifyForgotPasswordToken(access)).toBeNull();
  });
});
