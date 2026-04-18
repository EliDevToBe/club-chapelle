import { createError, type H3Event } from "h3";
import { userHasRoleAccess } from "~~/domain/user/role";
import type { RoleEnum } from "~~/shared/db-enums";

type AuthUserContext = {
  id: string;
  name: string | null;
  roles: RoleEnum[];
  authenticated: boolean;
};

const readAuthUser = (event: H3Event): AuthUserContext | null => {
  const fromContext = event.context.authUser as AuthUserContext | undefined;
  if (fromContext) {
    return fromContext;
  }

  return null;
};

/**
 * Requires an authenticated user with at least one role in `allowedRoles`,
 * except `developer`, which is always allowed after authentication (do not list it on routes).
 * Role hierarchy is **not** applied: list every non-developer role that may call the route (e.g. `["manager", "admin"]`).
 * Users with multiple roles pass if **any** role matches (or they have `developer`).
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

  if (!userHasRoleAccess(authUser.roles, allowedRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return authUser;
};
