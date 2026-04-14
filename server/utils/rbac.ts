import { createError, getHeader, type H3Event } from "h3";
import { ROLE_ORDER } from "~~/domain/user/role";
import type { RoleEnum } from "~~/shared/db-enums";

type AuthUserContext = {
  id: string;
  role: RoleEnum;
  authenticated: boolean;
};

const ROLE_INDEX = ROLE_ORDER.reduce<Record<RoleEnum, number>>(
  (acc, role, index) => {
    acc[role] = index;
    return acc;
  },
  {
    member: 0,
    manager: 1,
    admin: 2,
    developer: 3,
  },
);

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
) => {
  const userRoleIndex = ROLE_INDEX[userRole];
  return allowedRoles.some(
    (allowedRole) => userRoleIndex >= ROLE_INDEX[allowedRole],
  );
};

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
