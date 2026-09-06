import type { RevokeMemberAccessPersistence } from "~~/application/ports/revoke-member-access-persistence.port";
import type { UserId } from "~~/domain/user/user";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

export class PrismaRevokeMemberAccessPersistence
  implements RevokeMemberAccessPersistence
{
  public revokeAccess = async (userId: UserId): Promise<boolean> => {
    return prismaClient.$transaction(async (tx) => {
      const existing = await tx.auth_user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!existing) {
        return false;
      }

      await tx.archer.updateMany({
        where: { auth_user_id: userId },
        data: { auth_user_id: null },
      });

      await tx.auth_user.update({
        where: { id: userId },
        data: {
          authenticated: false,
          password: null,
        },
      });

      await tx.token.updateMany({
        where: {
          auth_user_id: userId,
          used_at: null,
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });

      return true;
    });
  };
}
