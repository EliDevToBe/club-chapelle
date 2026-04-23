import type {
  CompletePasswordResetInput,
  PasswordResetPersistence,
} from "~~/application/ports/password-reset-persistence.port";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

export class PrismaPasswordResetPersistence
  implements PasswordResetPersistence
{
  public completeReset = async (
    input: CompletePasswordResetInput,
  ): Promise<boolean> => {
    try {
      await prismaClient.$transaction(async (tx) => {
        await tx.auth_user.update({
          where: { id: input.authUserId },
          data: { password: input.passwordHash },
        });

        const tokenResult = await tx.token.updateMany({
          where: {
            token_value: input.tokenValue,
            auth_user_id: input.authUserId,
            type: "forgot_password",
            used_at: null,
            revoked_at: null,
            expires_at: { gt: new Date() },
          },
          data: { used_at: new Date() },
        });

        if (tokenResult.count !== 1) {
          throw new Error("PASSWORD_RESET_TOKEN_INVALID");
        }
      });
      return true;
    } catch {
      return false;
    }
  };
}
