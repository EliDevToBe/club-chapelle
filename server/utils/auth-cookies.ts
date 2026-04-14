import { deleteCookie, type H3Event, setCookie } from "h3";
import {
  CLUB_ACCESS_COOKIE,
  CLUB_REFRESH_COOKIE,
} from "~~/shared/auth/cookie-names";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "~~/shared/auth/jwt-lifetimes";

const baseCookieOptions = (_event: H3Event) => {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/" as const,
  };
};

export const setAuthSessionCookies = (
  event: H3Event,
  accessToken: string,
  refreshToken: string,
): void => {
  const base = baseCookieOptions(event);
  setCookie(event, CLUB_ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  setCookie(event, CLUB_REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
};

export const clearAuthSessionCookies = (event: H3Event): void => {
  const base = baseCookieOptions(event);
  deleteCookie(event, CLUB_ACCESS_COOKIE, base);
  deleteCookie(event, CLUB_REFRESH_COOKIE, base);
};
