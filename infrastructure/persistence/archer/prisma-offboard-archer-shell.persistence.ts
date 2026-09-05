import type {
  OffboardArcherShellPersistence,
  OffboardArcherShellResult,
} from "~~/application/ports/offboard-archer-shell-persistence.port";
import type { ArcherId } from "~~/domain/archer/archer";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

export class PrismaOffboardArcherShellPersistence
  implements OffboardArcherShellPersistence
{
  public offboardShell = async (
    id: ArcherId,
  ): Promise<OffboardArcherShellResult> => {
    const archer = await prismaClient.archer.findUnique({
      where: { id },
      select: { id: true, auth_user_id: true, offboarded_at: true },
    });
    if (!archer) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }
    if (archer.offboarded_at !== null) {
      return {
        ok: false,
        reason: API_ERROR_REASON.archer.already_offboarded,
      };
    }

    if (archer.auth_user_id !== null) {
      const linkedUser = await prismaClient.auth_user.findUnique({
        where: { id: archer.auth_user_id },
        select: { id: true },
      });
      if (linkedUser) {
        return { ok: false, reason: API_ERROR_REASON.archer.linked };
      }
    }

    await prismaClient.archer.update({
      where: { id },
      data: {
        offboarded_at: new Date(),
        auth_user_id: null,
      },
    });

    return { ok: true };
  };
}
