import type { RoleEnum } from "~~/shared/db-enums";

export type UserId = string;

/**
 * Authenticated account (matches `auth_user`; password stays in infrastructure only).
 * `roles` come from `auth_user_role`. An empty array means no RBAC privileges.
 * `name` is the account display name (distinct from archer `public_name`).
 */
export type User = {
  id: UserId;
  email: string;
  name: string | null;
  roles: RoleEnum[];
  authenticated: boolean;
  createdAt: Date;
};
