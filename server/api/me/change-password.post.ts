import { ChangeOwnPassword } from "~~/application/user/change-own-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { requireAuthenticated } from "~~/server/utils/rbac";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { parseOwnChangePasswordBody } from "~~/shared/user/own-profile.schema";

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
    const parsed = parseOwnChangePasswordBody(body);
    const { userRepository } = getRepositories();
    const authServices = createAuthServices({
      accessSecret,
      refreshSecret,
    });

    const changeOwnPasswordHandler = new ChangeOwnPassword(
      userRepository,
      authServices.password,
    );

    const result = await changeOwnPasswordHandler.change({
      userId: authUser.id,
      currentPassword: parsed.current_password,
      newPassword: parsed.new_password,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
