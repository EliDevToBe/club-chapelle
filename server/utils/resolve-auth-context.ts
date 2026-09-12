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
 * Session JWTs issued before `passwordChangedAt` are rejected (password change invalidates other devices).
 */
export const resolveAuthContextFromCookies = async (options: {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  jwt: JwtAuthService;
  findUserById: (id: string) => Promise<User | null>;
}): Promise<ResolveAuthContextResult> => {
  const { accessToken, refreshToken, jwt, findUserById } = options;

  const isIssuedBeforePasswordChange = (
    user: User,
    iatSeconds: number,
  ): boolean => {
    if (user.passwordChangedAt === null) {
      return false;
    }
    return iatSeconds * 1000 < user.passwordChangedAt.getTime();
  };

  if (accessToken) {
    const accessVerified = jwt.verifyAccess(accessToken);
    if (accessVerified) {
      const user = await findUserById(accessVerified.sub);
      if (user && !isIssuedBeforePasswordChange(user, accessVerified.iat)) {
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
    const refreshVerified = jwt.verifyRefresh(refreshToken);
    if (refreshVerified) {
      const user = await findUserById(refreshVerified.sub);
      if (user && !isIssuedBeforePasswordChange(user, refreshVerified.iat)) {
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
