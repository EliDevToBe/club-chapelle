import { ChangeOwnPassword } from "~~/application/user/change-own-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { setAuthSessionCookies } from "~~/server/utils/auth-cookies";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
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
    const { userRepository, tokenRepository } = getRepositories();
    const authServices = createAuthServices({
      accessSecret,
      refreshSecret,
    });
    const mailtrap = createMailtrapFromEvent(event);

    const changeOwnPasswordHandler = new ChangeOwnPassword(
      userRepository,
      authServices.password,
      tokenRepository,
      authServices.jwt,
      mailtrap.mail,
      {
        fromEmail: mailtrap.fromEmail,
        fromName: mailtrap.fromName,
        templateId: MAILTRAP_TEMPLATES_IDS.passwordChanged,
        siteOrigin: mailtrap.siteOrigin,
      },
    );

    const result = await changeOwnPasswordHandler.change({
      userId: authUser.id,
      currentPassword: parsed.current_password,
      newPassword: parsed.new_password,
    });
    if (!result.ok) {
      throw ApiError(result.reason);
    }

    // Re-issue session cookies so this browser stays signed in; other devices
    // are rejected on next request because their JWTs predate password_changed_at.
    setAuthSessionCookies(
      event,
      authServices.jwt.signAccess(authUser.id),
      authServices.jwt.signRefresh(authUser.id),
    );

    return { ok: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }
});
