import type { H3Event } from "h3";
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
} as unknown as H3Event;

describe("requireRoles", () => {
  it("allows access when role is explicitly authorised", () => {
    expect(() => requireRoles(baseEvent, ["member"])).not.toThrow();
  });

  it("allows access with inherited role permissions", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          role: "manager",
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["manager"])).not.toThrow();
  });

  it("rejects unauthenticated users with 401", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          id: "u3",
          role: "admin",
          authenticated: false,
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["member"])).toThrowError(
      "Authentication required",
    );
  });

  it("rejects role mismatch with 403", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          id: "u4",
          role: "member",
          authenticated: true,
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["admin"])).toThrowError("Forbidden");
  });
});
