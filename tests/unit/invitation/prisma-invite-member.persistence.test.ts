import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaInviteMemberPersistence } from "~~/infrastructure/persistence/invitation/prisma-invite-member.persistence";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

vi.mock("~~/infrastructure/persistence/prisma.client", () => {
  return {
    prismaClient: {
      $transaction: vi.fn(),
    },
  };
});

type TransactionClient = {
  archer: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  auth_user: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

const createTransactionClient = (): TransactionClient => {
  return {
    archer: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auth_user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };
};

describe("PrismaInviteMemberPersistence.bindInvitedMemberToArcher", () => {
  let persistence: PrismaInviteMemberPersistence;
  let tx: TransactionClient;

  const input = {
    archerId: "a-shell",
    email: "shell@club.test",
    name: "Shell Archer",
  };

  beforeEach(() => {
    persistence = new PrismaInviteMemberPersistence();
    tx = createTransactionClient();
    vi.mocked(prismaClient.$transaction).mockImplementation(
      async (callback) => {
        return callback(tx as never);
      },
    );
  });

  it("creates a fresh auth_user and links it to the shell", async () => {
    tx.archer.findUnique.mockResolvedValue({
      id: "a-shell",
      auth_user_id: null,
      public_name: "Shell Archer",
    });
    tx.auth_user.findFirst.mockResolvedValue(null);
    tx.auth_user.create.mockResolvedValue({
      id: "u-new",
      email: "shell@club.test",
      name: "Shell Archer",
      authenticated: false,
      password_changed_at: null,
      created_at: new Date("2026-09-01"),
      roles: [{ role: "member" }],
    });

    const result = await persistence.bindInvitedMemberToArcher(input);

    expect(result).toEqual({
      ok: true,
      user: expect.objectContaining({
        id: "u-new",
        email: "shell@club.test",
        roles: ["member"],
        authenticated: false,
      }),
      resent: false,
    });
    expect(tx.auth_user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "shell@club.test",
          authenticated: false,
          roles: { create: { role: "member" } },
        }),
      }),
    );
    expect(tx.archer.update).toHaveBeenCalledWith({
      where: { id: "a-shell" },
      data: { auth_user_id: "u-new", offboarded_at: null },
    });
  });

  it("rejects when the archer is already linked", async () => {
    tx.archer.findUnique.mockResolvedValue({
      id: "a-shell",
      auth_user_id: "u-linked",
    });

    const result = await persistence.bindInvitedMemberToArcher(input);

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.archer_already_linked,
    });
    expect(tx.auth_user.findFirst).not.toHaveBeenCalled();
  });

  it("rejects when the email belongs to an active account", async () => {
    tx.archer.findUnique.mockResolvedValue({
      id: "a-shell",
      auth_user_id: null,
    });
    tx.auth_user.findFirst.mockResolvedValue({
      id: "u-active",
      authenticated: true,
      archers: [],
    });

    const result = await persistence.bindInvitedMemberToArcher(input);

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.account_already_active,
    });
    expect(tx.auth_user.create).not.toHaveBeenCalled();
  });

  it("rejects when the email is linked to another archer", async () => {
    tx.archer.findUnique.mockResolvedValue({
      id: "a-shell",
      auth_user_id: null,
    });
    tx.auth_user.findFirst.mockResolvedValue({
      id: "u-pending",
      authenticated: false,
      archers: [{ id: "a-other" }],
    });

    const result = await persistence.bindInvitedMemberToArcher(input);

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.email_already_linked,
    });
    expect(tx.auth_user.create).not.toHaveBeenCalled();
  });

  it("returns not_found when the archer does not exist", async () => {
    tx.archer.findUnique.mockResolvedValue(null);

    const result = await persistence.bindInvitedMemberToArcher(input);

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
  });
});
