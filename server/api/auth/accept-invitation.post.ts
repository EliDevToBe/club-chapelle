import { authResetPasswordBodySchema } from "~~/app/schemas/auth-flow.zod";
import { AcceptInvitation } from "~~/application/user/accept-invitation.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { setAuthSessionCookies } from "~~/server/utils/auth-cookies";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { asStringOrEmpty } from "~~/shared/utils/base-string.helper";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const accessSecret = config.authJwtAccessSecret;
  const refreshSecret = config.authJwtRefreshSecret;
  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  const body = await readBody<Record<string, unknown>>(event);
  const parsed = authResetPasswordBodySchema.safeParse({
    token: asStringOrEmpty(body.token),
    password: asStringOrEmpty(body.password),
    confirmPassword: asStringOrEmpty(body.confirmPassword),
  });

  if (!parsed.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_request);
  }

  const { userRepository, acceptInvitationPersistence } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const acceptInvitationHandler = new AcceptInvitation(
    userRepository,
    authServices.password,
    authServices.jwt,
    acceptInvitationPersistence,
  );
  const result = await acceptInvitationHandler.accept({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.ok) {
    throw ApiError(result.reason);
  }

  setAuthSessionCookies(event, result.accessToken, result.refreshToken);
  return { ok: true, session: result.session };
});
