import type { H3Event } from "h3";
import { describe, expect, it } from "vitest";
import { resolveSessionFromEvent } from "~~/server/utils/resolve-session-from-event";

describe("resolveSessionFromEvent", () => {
  it("returns null session when authUser is missing", () => {
    const event = { context: {} } as H3Event;
    expect(resolveSessionFromEvent(event)).toEqual({ session: null });
  });

  it("returns null session when authUser is not authenticated", () => {
    const event = {
      context: {
        authUser: {
          id: "u1",
          name: "Sam",
          roles: ["member"],
          authenticated: false,
        },
      },
    } as unknown as H3Event;
    expect(resolveSessionFromEvent(event)).toEqual({ session: null });
  });

  it("returns public session payload when authenticated", () => {
    const event = {
      context: {
        authUser: {
          id: "u1",
          name: "Sam",
          roles: ["member", "manager"],
          authenticated: true,
        },
      },
    } as unknown as H3Event;
    expect(resolveSessionFromEvent(event)).toEqual({
      session: {
        id: "u1",
        name: "Sam",
        public_name: null,
        roles: ["member", "manager"],
      },
    });
  });
});
