import { ConfirmChangeEmail } from "~~/application/user/confirm-change-email.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireAuthenticated } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseOwnConfirmEmailChangeBody } from "~~/shared/user/own-profile.schema";

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
    const parsed = parseOwnConfirmEmailChangeBody(body);
    const { userRepository, tokenRepository } = getRepositories();
    const authServices = createAuthServices({
      accessSecret,
      refreshSecret,
    });

    const confirmChangeEmailHandler = new ConfirmChangeEmail(
      userRepository,
      tokenRepository,
      authServices.password,
    );

    const result = await confirmChangeEmailHandler.confirm({
      userId: authUser.id,
      otp: parsed.otp,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    return { ok: true, email: result.email };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
