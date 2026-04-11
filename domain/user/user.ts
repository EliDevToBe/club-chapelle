import type { RoleEnum } from "~~/shared/db-enums";

export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  role: RoleEnum;
};
