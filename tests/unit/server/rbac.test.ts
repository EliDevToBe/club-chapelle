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

  it("allows access when user role appears in allowedRoles", () => {
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

  it("does not treat higher roles as implicitly allowed", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          role: "admin",
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["manager"])).toThrowError("Forbidden");
  });

  it("allows access when higher roles are listed explicitly", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          role: "admin",
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["manager", "admin"])).not.toThrow();
  });

  it("allows developer on any route without listing developer in allowedRoles", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          role: "developer",
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["member"])).not.toThrow();
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
