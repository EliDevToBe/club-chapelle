import type { RoleEnum } from "~~/shared/db-enums";

export type UserId = string;

/** Authenticated account (matches `auth_user`; password stays in infrastructure only). */
export type User = {
  id: UserId;
  email: string;
  role: RoleEnum;
  authenticated: boolean;
  createdAt: Date;
};
