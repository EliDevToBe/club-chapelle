import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import { PrismaRevokeMemberAccessPersistence } from "~~/infrastructure/persistence/user/prisma-revoke-member-access.persistence";

vi.mock("~~/infrastructure/persistence/prisma.client", () => {
  return {
    prismaClient: {
      $transaction: vi.fn(),
    },
  };
});

type TransactionClient = {
  auth_user: {
    findUnique: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  archer: {
    updateMany: ReturnType<typeof vi.fn>;
  };
};

const createTransactionClient = (): TransactionClient => {
  return {
    auth_user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    archer: {
      updateMany: vi.fn(),
    },
  };
};

describe("PrismaRevokeMemberAccessPersistence", () => {
  let persistence: PrismaRevokeMemberAccessPersistence;
  let tx: TransactionClient;

  beforeEach(() => {
    persistence = new PrismaRevokeMemberAccessPersistence();
    tx = createTransactionClient();
    vi.mocked(prismaClient.$transaction).mockImplementation(
      async (callback) => {
        return callback(tx as never);
      },
    );
  });

  it("returns false when the user does not exist", async () => {
    tx.auth_user.findUnique.mockResolvedValue(null);

    const result = await persistence.revokeAccess("missing");

    expect(result).toBe(false);
    expect(tx.archer.updateMany).not.toHaveBeenCalled();
    expect(tx.auth_user.delete).not.toHaveBeenCalled();
  });

  it("unlinks archers and deletes a pending invite auth_user", async () => {
    tx.auth_user.findUnique.mockResolvedValue({ id: "u-pending" });

    const result = await persistence.revokeAccess("u-pending");

    expect(result).toBe(true);
    expect(tx.archer.updateMany).toHaveBeenCalledWith({
      where: { auth_user_id: "u-pending" },
      data: { auth_user_id: null },
    });
    expect(tx.auth_user.delete).toHaveBeenCalledWith({
      where: { id: "u-pending" },
    });
  });

  it("unlinks archers and deletes an active member auth_user", async () => {
    tx.auth_user.findUnique.mockResolvedValue({ id: "u-active" });

    const result = await persistence.revokeAccess("u-active");

    expect(result).toBe(true);
    expect(tx.archer.updateMany).toHaveBeenCalledWith({
      where: { auth_user_id: "u-active" },
      data: { auth_user_id: null },
    });
    expect(tx.auth_user.delete).toHaveBeenCalledWith({
      where: { id: "u-active" },
    });
  });
});
