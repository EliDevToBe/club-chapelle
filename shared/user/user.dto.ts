import type { RoleEnum } from "~~/shared/db-enums";

/** Full `auth_user` row shape for API serialization. */
export type UserDto = {
  id: string;
  email: string;
  role: RoleEnum;
  authenticated: boolean;
  created_at: string;
};

export type UserCreateDto = {
  email: string;
  role: RoleEnum;
  authenticated?: boolean;
  password?: string | null;
};

export type UserUpdateDto = Partial<UserCreateDto>;
