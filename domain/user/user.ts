import type { RoleEnum } from "~~/shared/db-enums";

/** Authenticated account (matches `auth_user`; password stays in infrastructure only). */
export type User = {
  id: string;
  email: string;
  role: RoleEnum;
  authenticated: boolean;
  createdAt: Date;
};
