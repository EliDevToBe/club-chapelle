import type {
  IssueTokenInput,
  TokenRepository,
} from "~~/application/ports/token-repository.port";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";

export class PrismaTokenRepository implements TokenRepository {
  /** Revokes unused tokens of the same type for the user, then inserts the new row. */
  public issueToken = async (input: IssueTokenInput): Promise<void> => {
    await prismaClient.$transaction(async (tx) => {
      await tx.token.updateMany({
        where: {
          auth_user_id: input.authUserId,
          type: input.type,
          used_at: null,
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });
      await tx.token.create({
        data: {
          auth_user_id: input.authUserId,
          token_value: input.tokenValue,
          type: input.type,
          expires_at: input.expiresAt,
        },
      });
    });
  };
}
