import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { UpdateOwnProfile } from "~~/application/user/update-own-profile.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("UpdateOwnProfile", () => {
  let users: UserRepository;

  const user = {
    id: "u1",
    email: "a@b.c",
    name: "Alex",
    roles: ["member"] as const,
    authenticated: true,
    createdAt: new Date("2026-01-01"),
  };

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn().mockResolvedValue({ ...user, name: "Sam" }),
      delete: vi.fn(),
    };
  });

  it("updates the account name", async () => {
    const handler = new UpdateOwnProfile(users);
    const result = await handler.update({ userId: "u1", name: "Sam" });

    expect(result).toEqual({
      ok: true,
      user: { ...user, name: "Sam" },
    });
    expect(users.update).toHaveBeenCalledWith("u1", { name: "Sam" });
  });

  it("returns not_found when the user is missing", async () => {
    users.update = vi.fn().mockResolvedValue(null);
    const handler = new UpdateOwnProfile(users);
    const result = await handler.update({ userId: "missing", name: "Sam" });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
  });
});
