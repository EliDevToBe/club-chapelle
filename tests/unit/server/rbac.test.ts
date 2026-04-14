import { describe, expect, it } from "vitest";
import { requireRoles } from "~~/server/utils/rbac";

const baseEvent = {
  context: {
    authUser: {
      id: "u1",
      role: "member",
      authenticated: true,
    },
  },
} as never;

describe("requireRoles", () => {
  it("allows access when role is explicitly authorised", () => {
    expect(() => requireRoles(baseEvent, ["member"])).not.toThrow();
  });

  it("allows access with inherited role permissions", () => {
    const event = {
      context: {
        authUser: {
          id: "u2",
          role: "admin",
          authenticated: true,
        },
      },
    } as never;

    expect(() => requireRoles(event, ["manager"])).not.toThrow();
  });

  it("rejects unauthenticated users with 401", () => {
    const event = {
      context: {
        authUser: {
          id: "u3",
          role: "admin",
          authenticated: false,
        },
      },
    } as never;

    expect(() => requireRoles(event, ["member"])).toThrowError(
      /Authentication required/,
    );
  });

  it("rejects role mismatch with 403", () => {
    const event = {
      context: {
        authUser: {
          id: "u4",
          role: "member",
          authenticated: true,
        },
      },
    } as never;

    expect(() => requireRoles(event, ["admin"])).toThrowError(/Forbidden/);
  });
});
