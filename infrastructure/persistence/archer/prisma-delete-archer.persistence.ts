import type {
  DeleteArcherPersistence,
  DeleteArcherShellResult,
} from "~~/application/ports/delete-archer-persistence.port";
import type { ArcherId } from "~~/domain/archer/archer";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

export class PrismaDeleteArcherPersistence implements DeleteArcherPersistence {
  public deleteShell = async (
    id: ArcherId,
  ): Promise<DeleteArcherShellResult> => {
    return prismaClient.$transaction(async (tx) => {
      const archer = await tx.archer.findUnique({
        where: { id },
        select: { id: true, auth_user_id: true },
      });
      if (!archer) {
        return { ok: false, reason: "not_found" };
      }
      if (archer.auth_user_id !== null) {
        return { ok: false, reason: "archer_linked" };
      }

      await tx.participation.deleteMany({
        where: { archer_id: id },
      });
      await tx.archer.delete({
        where: { id },
      });

      return { ok: true };
    });
  };
}
