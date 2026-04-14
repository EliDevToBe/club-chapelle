import { describe, expect, it, vi } from "vitest";
import { clearAuthSessionCookies } from "~~/server/utils/auth-cookies";
import {
  CLUB_ACCESS_COOKIE,
  CLUB_REFRESH_COOKIE,
} from "~~/shared/auth/cookie-names";

vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return {
    ...actual,
    deleteCookie: vi.fn(),
  };
});

describe("clearAuthSessionCookies", () => {
  it("clears both session cookies", async () => {
    const { deleteCookie } = await import("h3");
    const event = {} as Parameters<typeof clearAuthSessionCookies>[0];
    clearAuthSessionCookies(event);
    expect(deleteCookie).toHaveBeenCalledWith(
      event,
      CLUB_ACCESS_COOKIE,
      expect.objectContaining({ path: "/" }),
    );
    expect(deleteCookie).toHaveBeenCalledWith(
      event,
      CLUB_REFRESH_COOKIE,
      expect.objectContaining({ path: "/" }),
    );
  });
});
