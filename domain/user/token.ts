import type { TokenTypeEnum } from "~~/shared/db-enums";

/** One-time auth token (matches `token` table). */
export type Token = {
  id: string;
  authUserId: string;
  tokenValue: string;
  type: TokenTypeEnum;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
};
