import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { GetOwnProfile } from "~~/application/user/get-own-profile.use-case";

describe("GetOwnProfile", () => {
  let users: UserRepository;
  let archers: ArcherRepository;
  let tokens: TokenRepository;

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        roles: ["member"],
        authenticated: true,
        createdAt: new Date("2026-01-01"),
      }),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    archers = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPublicName: vi.fn(),
      findLinkedByAuthUserId: vi.fn().mockResolvedValue({
        id: "ar1",
        publicName: "Alex Public",
        authUserId: "u1",
        createdAt: new Date("2026-01-01"),
        offboardedAt: null,
      }),
      findMany: vi.fn(),
      findPage: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    tokens = {
      issueToken: vi.fn(),
      findUnusedByUserAndType: vi.fn().mockResolvedValue({
        id: "tok-1",
        authUserId: "u1",
        tokenValue: JSON.stringify({
          new_email: "new@club.test",
          otp_hash: "hash",
          failed_attempts: 0,
        }),
        type: "change_email",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      }),
      updateTokenValue: vi.fn(),
      markUsed: vi.fn(),
      revokeUnusedByUserAndType: vi.fn(),
    };
  });

  it("returns profile fields and a pending e-mail", async () => {
    const handler = new GetOwnProfile(users, archers, tokens);
    const result = await handler.get("u1");

    expect(result).toEqual({
      ok: true,
      profile: {
        id: "u1",
        name: "Alex",
        email: "a@b.c",
        public_name: "Alex Public",
        roles: ["member"],
        pending_email: "new@club.test",
      },
    });
  });
});
