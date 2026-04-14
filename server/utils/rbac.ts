import { createError, getHeader, type H3Event } from "h3";
import type { RoleEnum } from "~~/shared/db-enums";

type AuthUserContext = {
  id: string;
  role: RoleEnum;
  authenticated: boolean;
};

const isRoleEnum = (value: string): value is RoleEnum =>
  value === "member" ||
  value === "manager" ||
  value === "admin" ||
  value === "developer";

const readAuthUserFromHeaders = (event: H3Event): AuthUserContext | null => {
  const roleHeader = getHeader(event, "x-user-role");
  const idHeader = getHeader(event, "x-user-id");
  const authenticatedHeader = getHeader(event, "x-user-authenticated");

  if (!roleHeader || !idHeader || !authenticatedHeader) {
    return null;
  }

  if (!isRoleEnum(roleHeader)) {
    return null;
  }

  return {
    id: idHeader,
    role: roleHeader,
    authenticated: authenticatedHeader === "true",
  };
};

const readAuthUser = (event: H3Event): AuthUserContext | null => {
  const fromContext = event.context.authUser as AuthUserContext | undefined;
  if (fromContext) {
    return fromContext;
  }

  return readAuthUserFromHeaders(event);
};

const hasRoleAccess = (
  userRole: RoleEnum,
  allowedRoles: readonly RoleEnum[],
): boolean => {
  if (userRole === "developer") {
    return true;
  }

  return allowedRoles.includes(userRole);
};

/**
 * Requires an authenticated user whose `role` is **literally** one of `allowedRoles`,
 * except `developer`, which is always allowed after authentication (do not list it on routes).
 * Role hierarchy is **not** applied: list every non-developer role that may call the route (e.g. `["manager", "admin"]`).
 */
export const requireRoles = (
  event: H3Event,
  allowedRoles: readonly RoleEnum[],
): AuthUserContext => {
  const authUser = readAuthUser(event);
  if (!authUser?.authenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  if (!hasRoleAccess(authUser.role, allowedRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return authUser;
};
