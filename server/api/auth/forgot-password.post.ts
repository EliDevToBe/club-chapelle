import { authForgotPasswordFormSchema } from "~~/app/schemas/auth-flow.zod";
import { RequestForgotPassword } from "~~/application/user/request-forgot-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import { MAILTRAP_TEMPLATES_IDS } from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { createMailtrapFromEvent } from "~~/server/utils/mailtrap-from-config";
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
  const parsed = authForgotPasswordFormSchema.safeParse({
    email: asStringOrEmpty(body.email),
  });

  if (!parsed.success) {
    throw ApiError(API_ERROR_REASON.auth.invalid_email);
  }

  const { userRepository, tokenRepository } = getRepositories();
  const authServices = createAuthServices({
    accessSecret,
    refreshSecret,
  });
  const mailtrap = createMailtrapFromEvent(event);

  const requestForgotPasswordHandler = new RequestForgotPassword(
    userRepository,
    tokenRepository,
    authServices.jwt,
    mailtrap.mail,
    {
      fromEmail: mailtrap.fromEmail,
      fromName: mailtrap.fromName,
      templateId: MAILTRAP_TEMPLATES_IDS.forgotPassword,
      passwordResetOrigin: mailtrap.siteOrigin,
    },
  );

  await requestForgotPasswordHandler.request({ email: parsed.data.email });

  return { ok: true };
});
