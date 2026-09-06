import type {
  AcceptInvitationPersistence,
  CompleteInvitationInput,
} from "~~/application/ports/accept-invitation-persistence.port";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

export class PrismaAcceptInvitationPersistence
  implements AcceptInvitationPersistence
{
  public completeInvitation = async (
    input: CompleteInvitationInput,
  ): Promise<boolean> => {
    try {
      await prismaClient.$transaction(async (tx) => {
        await tx.auth_user.update({
          where: { id: input.authUserId },
          data: {
            password: input.passwordHash,
            authenticated: true,
          },
        });

        const tokenResult = await tx.token.updateMany({
          where: {
            token_value: input.tokenValue,
            auth_user_id: input.authUserId,
            type: "invitation",
            used_at: null,
            revoked_at: null,
            expires_at: { gt: new Date() },
          },
          data: { used_at: new Date() },
        });

        if (tokenResult.count !== 1) {
          throw new Error("INVITATION_TOKEN_INVALID");
        }
      });
      return true;
    } catch {
      return false;
    }
  };
}
