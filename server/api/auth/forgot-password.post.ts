import { authForgotPasswordFormSchema } from "~~/app/schemas/auth-flow.zod";
import { RequestForgotPassword } from "~~/application/user/request-forgot-password.use-case";
import { createAuthServices } from "~~/infrastructure/auth/auth-services.provider";
import {
  createMailtrapTransactionalMailSender,
  MAILTRAP_TEMPLATES_IDS,
} from "~~/infrastructure/mail/mailtrap-transactional-mail.sender";
import { getRepositories } from "~~/infrastructure/persistence/repositories.provider";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { asStringOrEmpty } from "~~/shared/utils/base-string.helper";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const {
    mailtrapApiKey: apiKey,
    mailtrapInboxId: inboxIdRaw,
    mailtrapFromEmail: fromEmail,
    mailtrapFromName: fromName,
    authJwtAccessSecret: accessSecret,
    authJwtRefreshSecret: refreshSecret,
  } = config;
  const sandbox = Boolean(config.mailtrapUseSandbox);

  if (!apiKey) {
    throw ApiError(API_ERROR_REASON.mail.not_configured);
  }

  if (!fromEmail) {
    throw ApiError(API_ERROR_REASON.mail.sender_not_configured);
  }

  if (!accessSecret || !refreshSecret || accessSecret === refreshSecret) {
    throw ApiError(API_ERROR_REASON.auth.not_configured);
  }

  let testInboxId: number | undefined;
  if (sandbox) {
    const parsed = Number.parseInt(inboxIdRaw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw ApiError(API_ERROR_REASON.mail.sandbox_inbox_not_configured);
    }
    testInboxId = parsed;
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
  const mailSender = createMailtrapTransactionalMailSender({
    apiKey,
    sandbox,
    testInboxId,
  });

  const templateId = MAILTRAP_TEMPLATES_IDS.forgotPassword;

  const passwordResetOrigin = (config.baseUrl as string) || "";

  const requestForgotPasswordHandler = new RequestForgotPassword(
    userRepository,
    tokenRepository,
    authServices.jwt,
    mailSender,
    {
      fromEmail,
      fromName,
      templateId,
      passwordResetOrigin,
    },
  );

  await requestForgotPasswordHandler.request({ email: parsed.data.email });

  return { ok: true };
});
