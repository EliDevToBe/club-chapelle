import type { H3Event } from "h3";
import { describe, expect, it } from "vitest";
import { requireDeveloper } from "~~/server/utils/rbac";

const baseEvent = {
  context: {
    authUser: {
      id: "u1",
      name: null as string | null,
      roles: ["developer"] as const,
      authenticated: true,
    },
  },
} as unknown as H3Event;

describe("requireDeveloper", () => {
  it("allows authenticated users with the developer role", () => {
    expect(() => requireDeveloper(baseEvent)).not.toThrow();
  });

  it("rejects admin-only users", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          roles: ["admin"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireDeveloper(event)).toThrowError("Forbidden");
  });

  it("rejects member-only users", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          roles: ["member"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireDeveloper(event)).toThrowError("Forbidden");
  });

  it("rejects unauthenticated users with 401", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          authenticated: false,
        },
      },
    } as unknown as H3Event;

    expect(() => requireDeveloper(event)).toThrowError(
      "Authentication required",
    );
  });
});
