import type { H3Event } from "h3";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let resolveSessionFromEvent: (event: H3Event) => {
  session: { id: string; name: string | null; roles: string[] } | null;
};

beforeAll(async () => {
  vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
  const mod = await import("~~/server/api/auth/session.get");
  resolveSessionFromEvent = mod.resolveSessionFromEvent;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("/api/auth/session", () => {
  it("returns null session when authUser is missing", async () => {
    const event = { context: {} } as H3Event;
    expect(resolveSessionFromEvent(event)).toEqual({ session: null });
  });

  it("returns null session when authUser is not authenticated", async () => {
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

  it("returns public session payload when authenticated", async () => {
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
        roles: ["member", "manager"],
      },
    });
  });
});
