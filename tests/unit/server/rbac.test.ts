import type { H3Event } from "h3";
import { describe, expect, it } from "vitest";
import { requireRoles } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

const baseEvent = {
  context: {
    authUser: {
      id: "u1",
      name: null as string | null,
      roles: ["member"] as const,
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
          roles: ["manager"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["manager"])).not.toThrow();
  });

  it("allows access when any of multiple user roles matches allowedRoles", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          roles: ["member", "manager"],
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
          roles: ["admin"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["manager"])).toThrow(
      expect.objectContaining({
        statusCode: 403,
        data: { reason: API_ERROR_REASON.common.forbidden },
      }),
    );
  });

  it("allows access when higher roles are listed explicitly", () => {
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

    expect(() => requireRoles(event, ["manager", "admin"])).not.toThrow();
  });

  it("denies developer when developer is not listed in allowedRoles", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          roles: ["developer"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["member"])).toThrow(
      expect.objectContaining({
        statusCode: 403,
        data: { reason: API_ERROR_REASON.common.forbidden },
      }),
    );
  });

  it("allows developer when an assigned role is listed in allowedRoles", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          roles: ["developer", "admin"],
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["admin"])).not.toThrow();
  });

  it("rejects unauthenticated users with 401", () => {
    const event = {
      ...baseEvent,
      context: {
        ...baseEvent.context,
        authUser: {
          ...baseEvent.context.authUser,
          id: "u3",
          roles: ["admin"],
          authenticated: false,
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["member"])).toThrow(
      expect.objectContaining({
        statusCode: 401,
        data: { reason: API_ERROR_REASON.common.unauthenticated },
      }),
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
          roles: ["member"],
          authenticated: true,
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["admin"])).toThrow(
      expect.objectContaining({
        statusCode: 403,
        data: { reason: API_ERROR_REASON.common.forbidden },
      }),
    );
  });

  it("does not trust legacy x-user-* headers without event.context", () => {
    const event = {
      context: {},
      node: {
        req: {
          headers: {
            "x-user-role": "admin",
            "x-user-id": "attacker",
            "x-user-authenticated": "true",
          },
        },
      },
    } as unknown as H3Event;

    expect(() => requireRoles(event, ["admin"])).toThrow(
      expect.objectContaining({
        statusCode: 401,
        data: { reason: API_ERROR_REASON.common.unauthenticated },
      }),
    );
  });
});
