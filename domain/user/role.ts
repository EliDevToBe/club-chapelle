import type { RoleEnum } from "~~/shared/db-enums";

export const ROLE_ORDER: readonly RoleEnum[] = [
  "member",
  "manager",
  "admin",
  "developer",
] as const satisfies RoleEnum[];
