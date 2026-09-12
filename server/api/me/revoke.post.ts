import { RevokeOwnAccess } from "~~/application/user/revoke-own-access.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { clearAuthSessionCookies } from "~~/server/utils/auth-cookies";
import { requireAuthenticated } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseOwnRevokeBody } from "~~/shared/user/own-profile.schema";

export default defineEventHandler(async (event) => {
  const authUser = requireAuthenticated(event);
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  const body = await readBody<Record<string, unknown>>(event);
  try {
    const parsed = parseOwnRevokeBody(body);
    const { userRepository, revokeMemberAccessPersistence } = getRepositories();
    const authServices = createAuthServices({
      accessSecret,
      refreshSecret,
    });

    const revokeOwnAccessHandler = new RevokeOwnAccess(
      userRepository,
      authServices.password,
      revokeMemberAccessPersistence,
    );

    const result = await revokeOwnAccessHandler.revoke({
      userId: authUser.id,
      currentPassword: parsed.current_password,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    clearAuthSessionCookies(event);
    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
