import { getCookie, getRequestURL, setCookie } from "h3";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { createRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { resolveAuthContextFromCookies } from "~~/server/utils/resolve-auth-context";
import {
  CLUB_ACCESS_COOKIE,
  CLUB_REFRESH_COOKIE,
} from "~~/shared/auth/cookie-names";
import { ACCESS_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

const baseCookieOptions = () => {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/" as const,
  };
};

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith("/api/")) {
    return;
  }
  if (path === "/api/auth/login") {
    return;
  }

  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret as string;
  const refreshSecret = config.authJwtRefreshSecret as string;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    return;
  }

  const accessToken = getCookie(event, CLUB_ACCESS_COOKIE);
  const refreshToken = getCookie(event, CLUB_REFRESH_COOKIE);
  const { jwt } = createAuthServices({
    accessSecret,
    refreshSecret,
  });

  const repos = createRepositories();

  const { authUser, newAccessToken } = await resolveAuthContextFromCookies({
    accessToken,
    refreshToken,
    jwt,
    findUserById: repos.userRepository.findById,
  });

  if (authUser) {
    event.context.authUser = authUser;
  }

  if (newAccessToken) {
    setCookie(event, CLUB_ACCESS_COOKIE, newAccessToken, {
      ...baseCookieOptions(),
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
  }
});
