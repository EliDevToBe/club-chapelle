import type { Token } from "~~/domain/user/token";
import type { UserId } from "~~/domain/user/user";
import type { TokenTypeEnum } from "~~/shared/db-enums";

export type IssueTokenInput = {
  authUserId: UserId;
  type: TokenTypeEnum;
  tokenValue: string;
  expiresAt: Date;
};

export interface TokenRepository {
  /** Revokes unused tokens of the same type for the user, then inserts the new row. */
  issueToken: (input: IssueTokenInput) => Promise<void>;
  findUnusedByUserAndType: (
    authUserId: UserId,
    type: TokenTypeEnum,
  ) => Promise<Token | null>;
  updateTokenValue: (id: string, tokenValue: string) => Promise<boolean>;
  markUsed: (id: string) => Promise<boolean>;
  revokeUnusedByUserAndType: (
    authUserId: UserId,
    type: TokenTypeEnum,
  ) => Promise<boolean>;
}
