import type { Role } from "./role";

export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  role: Role;
};
