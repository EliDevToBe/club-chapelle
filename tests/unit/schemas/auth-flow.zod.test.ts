import { describe, expect, it } from "vitest";
import {
  authForgotPasswordFormSchema,
  authInvitationRegisterFormSchema,
  authLoginFormSchema,
  authResetPasswordBodySchema,
  passwordPolicySchema,
} from "~~/app/schemas/auth-flow.zod";

describe("authLoginFormSchema", () => {
  it("accepts valid email and non-empty trimmed password", () => {
    const r = authLoginFormSchema.safeParse({
      email: "  user@example.com ",
      password: "  secret  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("user@example.com");
      expect(r.data.password).toBe("secret");
    }
  });

  it("rejects invalid email", () => {
    const r = authLoginFormSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty password after trim", () => {
    const r = authLoginFormSchema.safeParse({
      email: "user@example.com",
      password: "   ",
    });
    expect(r.success).toBe(false);
  });
});

describe("authForgotPasswordFormSchema", () => {
  it("accepts trimmed email", () => {
    const r = authForgotPasswordFormSchema.safeParse({
      email: "  a@b.co  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("a@b.co");
    }
  });
});

describe("passwordPolicySchema", () => {
  it("accepts a strong password", () => {
    const r = passwordPolicySchema.safeParse("Aa1!aaaa");
    expect(r.success).toBe(true);
  });

  it("rejects short password", () => {
    const r = passwordPolicySchema.safeParse("Aa1!x");
    expect(r.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const r = passwordPolicySchema.safeParse("aa1!aaaa");
    expect(r.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const r = passwordPolicySchema.safeParse("Abcdef!!");
    expect(r.success).toBe(false);
  });

  it("rejects password without special character", () => {
    const r = passwordPolicySchema.safeParse("Abcdef12");
    expect(r.success).toBe(false);
  });
});

describe("authInvitationRegisterFormSchema", () => {
  it("accepts matching strong passwords with trim", () => {
    const r = authInvitationRegisterFormSchema.safeParse({
      password: "  Aa1!goodpass  ",
      confirmPassword: "  Aa1!goodpass  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.password).toBe("Aa1!goodpass");
      expect(r.data.confirmPassword).toBe("Aa1!goodpass");
    }
  });

  it("matches when confirm has spaces that trim to same password", () => {
    const r = authInvitationRegisterFormSchema.safeParse({
      password: "Aa1!goodpass",
      confirmPassword: "Aa1!goodpass ",
    });
    expect(r.success).toBe(true);
  });

  it("rejects mismatch after trim", () => {
    const r = authInvitationRegisterFormSchema.safeParse({
      password: "Aa1!goodpass",
      confirmPassword: "Aa1!otherpass",
    });
    expect(r.success).toBe(false);
  });

  it("rejects weak password", () => {
    const r = authInvitationRegisterFormSchema.safeParse({
      password: "weak",
      confirmPassword: "weak",
    });
    expect(r.success).toBe(false);
  });
});

describe("authResetPasswordBodySchema", () => {
  it("accepts token and matching strong passwords", () => {
    const r = authResetPasswordBodySchema.safeParse({
      token: "jwt-value",
      password: "Aa1!goodpass",
      confirmPassword: "Aa1!goodpass",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty token", () => {
    const r = authResetPasswordBodySchema.safeParse({
      token: "",
      password: "Aa1!goodpass",
      confirmPassword: "Aa1!goodpass",
    });
    expect(r.success).toBe(false);
  });
});
