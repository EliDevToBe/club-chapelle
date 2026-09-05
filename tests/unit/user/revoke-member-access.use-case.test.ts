import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RevokeMemberAccessPersistence } from "~~/application/ports/revoke-member-access-persistence.port";
import { RevokeMemberAccess } from "~~/application/user/revoke-member-access.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("RevokeMemberAccess", () => {
  let persistence: RevokeMemberAccessPersistence;

  beforeEach(() => {
    persistence = {
      revokeAccess: vi.fn().mockResolvedValue(true),
    };
  });

  it("revokes another user’s access", async () => {
    const handler = new RevokeMemberAccess(persistence);
    const result = await handler.revoke({
      targetUserId: "u-target",
      actorUserId: "u-admin",
    });

    expect(result).toEqual({ ok: true });
    expect(persistence.revokeAccess).toHaveBeenCalledWith("u-target");
  });

  it("rejects self-revoke", async () => {
    const handler = new RevokeMemberAccess(persistence);
    const result = await handler.revoke({
      targetUserId: "u-admin",
      actorUserId: "u-admin",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.user.self_revoke,
    });
    expect(persistence.revokeAccess).not.toHaveBeenCalled();
  });

  it("returns not_found when persistence finds no user", async () => {
    persistence.revokeAccess = vi.fn().mockResolvedValue(false);
    const handler = new RevokeMemberAccess(persistence);
    const result = await handler.revoke({
      targetUserId: "missing",
      actorUserId: "u-admin",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
  });
});
