import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { User } from "~~/domain/user/user";
import type { RoleEnum } from "~~/shared/db-enums";

export type ResolvedAuthUser = {
  id: string;
  name: string | null;
  roles: RoleEnum[];
  authenticated: boolean;
};

export type ResolveAuthContextResult = {
  authUser: ResolvedAuthUser | null;
  newAccessToken: string | null;
};

/**
 * Validates `club-access` then `club-refresh`; if refresh is used, returns a new access JWT string to set on the response.
 */
export const resolveAuthContextFromCookies = async (options: {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  jwt: JwtAuthService;
  findUserById: (id: string) => Promise<User | null>;
}): Promise<ResolveAuthContextResult> => {
  const { accessToken, refreshToken, jwt, findUserById } = options;

  if (accessToken) {
    const accessSub = jwt.verifyAccess(accessToken);
    if (accessSub) {
      const user = await findUserById(accessSub);
      if (user) {
        return {
          authUser: {
            id: user.id,
            name: user.name,
            roles: user.roles,
            authenticated: user.authenticated,
          },
          newAccessToken: null,
        };
      }
    }
  }

  if (refreshToken) {
    const refreshSub = jwt.verifyRefresh(refreshToken);
    if (refreshSub) {
      const user = await findUserById(refreshSub);
      if (user) {
        return {
          authUser: {
            id: user.id,
            name: user.name,
            roles: user.roles,
            authenticated: user.authenticated,
          },
          newAccessToken: jwt.signAccess(user.id),
        };
      }
    }
  }

  return { authUser: null, newAccessToken: null };
};
