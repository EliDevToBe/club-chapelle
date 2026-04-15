import { clearAuthSessionCookies } from "~~/server/utils/auth-cookies";

export default defineEventHandler(async (event) => {
  clearAuthSessionCookies(event);
  return { ok: true };
});
