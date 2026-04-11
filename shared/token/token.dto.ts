import type { TokenTypeEnum } from "~~/shared/db-enums";

/** Full `token` row shape. Treat `token_value` as secret at the HTTP boundary. */
export type TokenDto = {
  id: string;
  auth_user_id: string;
  token_value: string;
  type: TokenTypeEnum;
  created_at: string;
  expires_at: string;
  used_at: string | null;
};
