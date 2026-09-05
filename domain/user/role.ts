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
export const sortRolesByOrder = (roles: readonly RoleEnum[]): RoleEnum[] => {
  return [...new Set(roles)].sort((a, b) => {
    return roleOrderIndex(a) - roleOrderIndex(b);
  });
};

/** Highest rank in `ROLE_ORDER` (developer > admin > manager > member). Empty → -1. */
export const highestRoleRank = (roles: readonly RoleEnum[]): number => {
  if (roles.length === 0) {
    return -1;
  }

  return Math.max(...roles.map((role) => roleOrderIndex(role)));
};

/**
 * RBAC: at least one user role must appear in `allowedRoles`.
 * No implicit hierarchy (Admin > Manager > Member) and no role bypasses the allow-list.
 * Use `requireDeveloper` on routes that must be developer-only.
 */
export const userHasRoleAccess = (
  userRoles: readonly RoleEnum[],
  allowedRoles: readonly RoleEnum[],
): boolean => {
  return userRoles.some((role) => {
    return allowedRoles.includes(role);
  });
};
