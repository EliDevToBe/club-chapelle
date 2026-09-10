import type {
  IssueTokenInput,
  TokenRepository,
} from "~~/application/ports/token-repository.port";
import type { Token } from "~~/domain/user/token";
import type { token } from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import type { TokenTypeEnum } from "~~/shared/db-enums";

const toDomain = (row: token): Token => {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    tokenValue: row.token_value,
    type: row.type,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  };
};

const unusedWhere = (authUserId: string, type: TokenTypeEnum) => {
  return {
    auth_user_id: authUserId,
    type,
    used_at: null,
    revoked_at: null,
  };
};

export class PrismaTokenRepository implements TokenRepository {
  /** Revokes unused tokens of the same type for the user, then inserts the new row. */
  public issueToken = async (input: IssueTokenInput): Promise<void> => {
    await prismaClient.$transaction(async (tx) => {
      await tx.token.updateMany({
        where: unusedWhere(input.authUserId, input.type),
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

  public findUnusedByUserAndType = async (
    authUserId: string,
    type: TokenTypeEnum,
  ): Promise<Token | null> => {
    const row = await prismaClient.token.findFirst({
      where: unusedWhere(authUserId, type),
      orderBy: { created_at: "desc" },
    });
    return row ? toDomain(row) : null;
  };

  public updateTokenValue = async (
    id: string,
    tokenValue: string,
  ): Promise<boolean> => {
    const result = await prismaClient.token.updateMany({
      where: { id, used_at: null, revoked_at: null },
      data: { token_value: tokenValue },
    });
    return result.count > 0;
  };

  public markUsed = async (id: string): Promise<boolean> => {
    const result = await prismaClient.token.updateMany({
      where: { id, used_at: null, revoked_at: null },
      data: { used_at: new Date() },
    });
    return result.count > 0;
  };

  public revokeUnusedByUserAndType = async (
    authUserId: string,
    type: TokenTypeEnum,
  ): Promise<boolean> => {
    const result = await prismaClient.token.updateMany({
      where: unusedWhere(authUserId, type),
      data: { revoked_at: new Date() },
    });
    return result.count > 0;
  };
}
