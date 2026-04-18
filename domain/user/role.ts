import type { RoleEnum } from "~~/shared/db-enums";

export const ROLE_ORDER: readonly RoleEnum[] = [
  "member",
  "manager",
  "admin",
  "developer",
] as const satisfies RoleEnum[];

const roleOrderIndex = (role: RoleEnum): number => {
  const i = ROLE_ORDER.indexOf(role);
  return i === -1 ? ROLE_ORDER.length : i;
};

/** Dedupes, sorts by `ROLE_ORDER` for stable API and tests. */
export const sortRolesByOrder = (roles: readonly RoleEnum[]): RoleEnum[] =>
  [...new Set(roles)].sort((a, b) => roleOrderIndex(a) - roleOrderIndex(b));

/**
 * RBAC: `developer` always passes; otherwise at least one user role must be in `allowedRoles`.
 * No implicit hierarchy between non-developer roles.
 */
export const userHasRoleAccess = (
  userRoles: readonly RoleEnum[],
  allowedRoles: readonly RoleEnum[],
): boolean => {
  if (userRoles.includes("developer")) {
    return true;
  }
  return userRoles.some((r) => allowedRoles.includes(r));
};
